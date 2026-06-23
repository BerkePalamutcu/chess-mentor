from typing import Optional

from fastapi import APIRouter, Depends
from sqlmodel import Session

from auth.dependencies import get_current_user
from db.database import get_session
from db.models import User
from puzzles.schemas import AttemptIn, AttemptOut, HistoryOut, PuzzleOut, PuzzleProfileOut, ThemesOut
from puzzles.service import get_all_themes, get_history, get_next_puzzle, get_profile, submit_attempt

router = APIRouter(prefix="/puzzles", tags=["puzzles"])


@router.get("/next", response_model=PuzzleOut)
def next_puzzle(
    min_rating: Optional[int] = None,
    max_rating: Optional[int] = None,
    themes: Optional[str] = None,   # comma-separated
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    theme_list = [t.strip() for t in themes.split(",")] if themes else None
    return get_next_puzzle(session, current_user.id, min_rating, max_rating, theme_list)


@router.post("/attempt", response_model=AttemptOut)
def record_attempt(
    data: AttemptIn,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return submit_attempt(session, current_user.id, data)


@router.get("/history", response_model=HistoryOut)
def history(
    result: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "date",
    order: str = "desc",
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return get_history(session, current_user.id, result, search, sort, order, limit, offset)


@router.get("/profile", response_model=PuzzleProfileOut)
def puzzle_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return get_profile(session, current_user.id)


@router.get("/themes", response_model=ThemesOut)
def themes(session: Session = Depends(get_session)):
    return ThemesOut(themes=get_all_themes(session))
