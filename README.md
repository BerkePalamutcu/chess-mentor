# Chess Mentor

A chess puzzle trainer with JWT auth, an Elo-rated puzzle engine, and a themeable
board. Two-package monorepo:

- `backend/` — FastAPI (Python 3.12+, managed with [uv](https://docs.astral.sh/uv/))
- `frontend/` — React 19 + Vite (npm)

## Prerequisites

- Python 3.12+ and `uv`
- Node 23 / npm

## Backend (run from `backend/`)

### 1. Configure `.env`

Create a file named `.env` in `backend/` with the following variables:

```ini
# JWT signing key — keep secret. Generate one with:
#   python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your-long-random-hex-string

# Token lifetimes
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
DATABASE_URL=sqlite:///./chess_mentor.db

# CORS — comma-separated list of allowed frontend origins
FRONTEND_ORIGINS=http://localhost:5173,http://localhost:5174
```

Only `SECRET_KEY` is required; the rest fall back to the defaults shown above if omitted.

### 2. Seed puzzles & run

```bash
# Seed puzzles into the SQLite DB (first run only)
uv run python scripts/seed_puzzles.py            # ~10,000 puzzles

# Start the API
uv run uvicorn main:app --host 127.0.0.1 --port 8123 --reload
```

API runs at <http://127.0.0.1:8123> (interactive docs at `/docs`).
Port 8000 is occupied on some machines — this project uses **8123**.

## Frontend (run from `frontend/`)

```bash
npm install        # first run only
npm run dev        # dev server, auto-selects a port from 5173+
```

The Vite dev server proxies `/api/*` → `http://127.0.0.1:8123`, so start the
backend first. Open the printed URL (e.g. <http://localhost:5173>) and register
an account.

## Tests

```bash
# Backend (from backend/)
uv run pytest

# Frontend (from frontend/)
npm test
```

## Production build (frontend)

```bash
npm run build      # tsc -b && vite build → dist/
```
