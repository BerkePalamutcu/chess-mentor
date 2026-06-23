import json
import math
import random
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlmodel import Session, and_, func, or_, select

from db.models import Puzzle, PuzzleAttempt, User, UserPuzzleProfile
from puzzles.schemas import (
    AttemptIn,
    AttemptOut,
    HistoryOut,
    PuzzleAttemptOut,
    PuzzleOut,
    PuzzleProfileOut,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _puzzle_to_out(p: Puzzle) -> PuzzleOut:
    return PuzzleOut(
        id=p.id,
        lichess_id=p.lichess_id,
        fen=p.fen,
        moves=p.moves.split(),
        rating=p.rating,
        themes=[t for t in p.themes.split() if t],
        opening_tags=[t for t in (p.opening_tags or "").split() if t],
        popularity=p.popularity,
    )


def _get_or_create_profile(session: Session, user_id: int) -> UserPuzzleProfile:
    profile = session.exec(
        select(UserPuzzleProfile).where(UserPuzzleProfile.user_id == user_id)
    ).first()
    if not profile:
        profile = UserPuzzleProfile(user_id=user_id)
        session.add(profile)
        session.commit()
        session.refresh(profile)
    return profile


def _k_factor(attempts: int) -> float:
    if attempts < 30:
        return 40.0
    if attempts < 100:
        return 32.0
    return 24.0


def _elo_change(user_rating: float, puzzle_rating: int, score: float, k: float) -> float:
    expected = 1.0 / (1.0 + 10 ** ((puzzle_rating - user_rating) / 400))
    return k * (score - expected)


def _score_from_attempt(data: AttemptIn) -> float:
    if data.result == "failed" or data.solution_revealed:
        return 0.0
    # Solved — penalise hints and mistakes inferred from extra moves
    if data.hints_used == 0:
        return 1.0
    if data.hints_used == 1:
        return 0.75
    return 0.5


# ── Public API ────────────────────────────────────────────────────────────────

def get_next_puzzle(
    session: Session,
    user_id: int,
    min_rating: Optional[int],
    max_rating: Optional[int],
    themes: Optional[list[str]],
) -> PuzzleOut:
    profile = _get_or_create_profile(session, user_id)

    lo = min_rating if min_rating is not None else max(0, int(profile.rating) - 200)
    hi = max_rating if max_rating is not None else int(profile.rating) + 200

    # Exclude last 30 attempted puzzles to avoid repetition
    recent_ids: list[int] = list(session.exec(
        select(PuzzleAttempt.puzzle_id)
        .where(PuzzleAttempt.user_id == user_id)
        .order_by(PuzzleAttempt.created_at.desc())
        .limit(30)
    ).all())

    def _build_query(exclude: list[int]):
        q = select(Puzzle).where(Puzzle.rating >= lo, Puzzle.rating <= hi)
        if themes:
            q = q.where(or_(*[Puzzle.themes.contains(t) for t in themes]))
        if exclude:
            q = q.where(Puzzle.id.not_in(exclude))
        return q

    candidates = session.exec(_build_query(recent_ids).limit(20)).all()
    if not candidates:
        # Relax recent exclusion
        candidates = session.exec(_build_query([]).limit(20)).all()
    if not candidates:
        # Relax rating window
        candidates = session.exec(select(Puzzle).limit(20)).all()
    if not candidates:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No puzzles found — run the seed script first")

    return _puzzle_to_out(random.choice(candidates))


def submit_attempt(session: Session, user_id: int, data: AttemptIn) -> AttemptOut:
    puzzle = session.get(Puzzle, data.puzzle_id)
    if not puzzle:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Puzzle not found")

    profile = _get_or_create_profile(session, user_id)
    rating_before = profile.rating
    now = datetime.now(timezone.utc)

    # Keep at most one attempt row per (user, puzzle). Re-solving a puzzle must not inflate
    # stats/rating — only the FIRST attempt of a puzzle updates the profile. Repeats just refresh
    # the stored record (latest result, moves and date).
    existing = list(session.exec(
        select(PuzzleAttempt)
        .where(PuzzleAttempt.user_id == user_id, PuzzleAttempt.puzzle_id == data.puzzle_id)
        .order_by(PuzzleAttempt.created_at.desc())
    ).all())
    is_repeat = len(existing) > 0

    if is_repeat:
        delta = 0.0
        attempt = existing[0]
        for stale in existing[1:]:   # collapse any legacy duplicate rows
            session.delete(stale)
        attempt.result = data.result
        attempt.moves_played = json.dumps(data.moves_played)
        attempt.hints_used = data.hints_used
        attempt.solution_revealed = data.solution_revealed
        attempt.time_seconds = data.time_seconds
        attempt.rating_after = profile.rating
        attempt.created_at = now     # represents the most recent attempt date
        session.add(attempt)
    else:
        score = _score_from_attempt(data)
        k = _k_factor(profile.puzzles_attempted)
        delta = _elo_change(profile.rating, puzzle.rating, score, k)

        profile.rating = max(100.0, profile.rating + delta)
        profile.rating_deviation = max(30.0, profile.rating_deviation * 0.98)
        profile.puzzles_attempted += 1
        if data.result == "solved" and not data.solution_revealed:
            profile.puzzles_solved += 1
            profile.streak += 1
            profile.best_streak = max(profile.best_streak, profile.streak)
        else:
            profile.streak = 0
        profile.updated_at = now

        attempt = PuzzleAttempt(
            user_id=user_id,
            puzzle_id=data.puzzle_id,
            result=data.result,
            moves_played=json.dumps(data.moves_played),
            hints_used=data.hints_used,
            solution_revealed=data.solution_revealed,
            time_seconds=data.time_seconds,
            rating_before=rating_before,
            rating_after=profile.rating,
            created_at=now,
        )
        session.add(attempt)
        session.add(profile)

    session.commit()

    return AttemptOut(
        rating_before=rating_before,
        rating_after=profile.rating,
        delta=delta,
        puzzles_solved=profile.puzzles_solved,
        puzzles_attempted=profile.puzzles_attempted,
        streak=profile.streak,
        is_repeat=is_repeat,
    )


def get_profile(session: Session, user_id: int) -> PuzzleProfileOut:
    profile = _get_or_create_profile(session, user_id)
    return PuzzleProfileOut(
        rating=round(profile.rating, 1),
        rating_deviation=round(profile.rating_deviation, 1),
        puzzles_solved=profile.puzzles_solved,
        puzzles_attempted=profile.puzzles_attempted,
        streak=profile.streak,
        best_streak=profile.best_streak,
    )


def get_history(
    session: Session,
    user_id: int,
    result: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "date",
    order: str = "desc",
    limit: int = 50,
    offset: int = 0,
) -> HistoryOut:
    # One row per puzzle: keep only each puzzle's most recent attempt (guards against any
    # legacy duplicate rows that predate the upsert in submit_attempt).
    latest = (
        select(
            PuzzleAttempt.puzzle_id.label("pid"),
            func.max(PuzzleAttempt.created_at).label("mx"),
        )
        .where(PuzzleAttempt.user_id == user_id)
        .group_by(PuzzleAttempt.puzzle_id)
        .subquery()
    )

    # Join attempts with their puzzle so we can filter/search/sort on puzzle fields.
    base = (
        select(PuzzleAttempt, Puzzle)
        .join(Puzzle, Puzzle.id == PuzzleAttempt.puzzle_id)
        .join(latest, and_(
            PuzzleAttempt.puzzle_id == latest.c.pid,
            PuzzleAttempt.created_at == latest.c.mx,
        ))
        .where(PuzzleAttempt.user_id == user_id)
    )

    if result in ("solved", "failed"):
        base = base.where(PuzzleAttempt.result == result)
    if search:
        term = f"%{search.strip()}%"
        base = base.where(or_(Puzzle.themes.ilike(term), Puzzle.lichess_id.ilike(term)))

    # Total count for pagination (before limit/offset).
    total = session.exec(
        select(func.count()).select_from(base.subquery())
    ).one()

    sort_col = {
        "date": PuzzleAttempt.created_at,
        "rating": Puzzle.rating,
        "result": PuzzleAttempt.result,
    }.get(sort, PuzzleAttempt.created_at)
    sort_col = sort_col.asc() if order == "asc" else sort_col.desc()

    rows = session.exec(
        base.order_by(sort_col).offset(max(0, offset)).limit(max(1, min(limit, 200)))
    ).all()

    items = [
        PuzzleAttemptOut(
            id=attempt.id,
            puzzle_id=puzzle.id,
            lichess_id=puzzle.lichess_id,
            fen=puzzle.fen,
            moves=puzzle.moves.split(),
            rating=puzzle.rating,
            themes=[t for t in puzzle.themes.split() if t],
            opening_tags=[t for t in (puzzle.opening_tags or "").split() if t],
            result=attempt.result,
            moves_played=json.loads(attempt.moves_played or "[]"),
            hints_used=attempt.hints_used,
            solution_revealed=attempt.solution_revealed,
            time_seconds=attempt.time_seconds,
            rating_before=attempt.rating_before,
            rating_after=attempt.rating_after,
            created_at=attempt.created_at,
        )
        for attempt, puzzle in rows
    ]
    return HistoryOut(items=items, total=total)


def get_all_themes(session: Session) -> list[str]:
    rows = session.exec(select(Puzzle.themes)).all()
    seen: set[str] = set()
    for row in rows:
        for t in (row or "").split():
            if t:
                seen.add(t)
    return sorted(seen)
