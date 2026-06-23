from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True


class RefreshToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    token_hash: str = Field(index=True)
    user_id: int = Field(foreign_key="user.id")
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ── Puzzle tables ──────────────────────────────────────────────────────────────

class Puzzle(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    lichess_id: str = Field(unique=True, index=True)
    fen: str                         # Position BEFORE the setup move
    moves: str                       # Space-separated UCI: setup_move solution_move1 ...
    rating: int = Field(index=True)
    rating_deviation: int = Field(default=80)
    themes: str = Field(default="")  # Space-separated Lichess theme tags
    opening_tags: Optional[str] = None
    popularity: int = Field(default=0)
    nb_plays: int = Field(default=0)


class UserPuzzleProfile(SQLModel, table=True):
    __tablename__ = "user_puzzle_profile"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, index=True)
    rating: float = Field(default=1200.0)
    rating_deviation: float = Field(default=350.0)
    puzzles_solved: int = Field(default=0)
    puzzles_attempted: int = Field(default=0)
    streak: int = Field(default=0)
    best_streak: int = Field(default=0)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PuzzleAttempt(SQLModel, table=True):
    __tablename__ = "puzzle_attempt"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    puzzle_id: int = Field(foreign_key="puzzle.id", index=True)
    result: str                      # "solved" | "failed"
    moves_played: str = Field(default="[]")   # JSON array of UCI moves
    hints_used: int = Field(default=0)
    solution_revealed: bool = Field(default=False)
    time_seconds: float = Field(default=0.0)
    rating_before: float
    rating_after: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
