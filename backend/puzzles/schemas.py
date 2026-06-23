from datetime import datetime

from pydantic import BaseModel


class PuzzleOut(BaseModel):
    id: int
    lichess_id: str
    fen: str
    moves: list[str]        # All UCI moves (index 0 = setup, rest = solution)
    rating: int
    themes: list[str]
    opening_tags: list[str]
    popularity: int


class AttemptIn(BaseModel):
    puzzle_id: int
    result: str             # "solved" | "failed"
    moves_played: list[str]
    hints_used: int = 0
    solution_revealed: bool = False
    time_seconds: float = 0.0


class AttemptOut(BaseModel):
    rating_before: float
    rating_after: float
    delta: float
    puzzles_solved: int
    puzzles_attempted: int
    streak: int
    is_repeat: bool = False   # True when this puzzle was already attempted (stats not changed)


class PuzzleProfileOut(BaseModel):
    rating: float
    rating_deviation: float
    puzzles_solved: int
    puzzles_attempted: int
    streak: int
    best_streak: int


class ThemesOut(BaseModel):
    themes: list[str]


class PuzzleAttemptOut(BaseModel):
    id: int                         # attempt id
    puzzle_id: int
    lichess_id: str
    fen: str
    moves: list[str]                # full solution (index 0 = setup move)
    rating: int
    themes: list[str]
    opening_tags: list[str]
    result: str                     # "solved" | "failed"
    moves_played: list[str]
    hints_used: int
    solution_revealed: bool
    time_seconds: float
    rating_before: float
    rating_after: float
    created_at: datetime


class HistoryOut(BaseModel):
    items: list[PuzzleAttemptOut]
    total: int                      # total rows matching the filter (for pagination)
