# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

Two-package monorepo with independent dependency management — no shared workspace tooling.
- `backend/` — uv-managed Python (FastAPI). Its own `pyproject.toml` + `uv.lock`.
- `frontend/` — npm (React 19 + Vite). Its own `package.json`.
- The root `pyproject.toml` / `uv.lock` / `.venv` are an unused shell; ignore them.

## Commands

Backend (run from `backend/`):
```bash
uv run uvicorn main:app --host 127.0.0.1 --port 8123 --reload
```
Port 8000 is occupied on this machine — always use **8123** (or another free port).

Frontend (run from `frontend/`):
```bash
npm run dev        # dev server (auto-selects port from 5173+)
npm run build      # tsc -b && vite build — type errors fail the build
npm run lint
```

The Vite dev server proxies `/api/*` → `http://127.0.0.1:8123` (strips `/api`). Frontend API calls use `/api/auth/...`.

## Architecture

### Backend (`backend/`)

```
core/config.py      — SECRET_KEY, token expiry, CORS origins, DATABASE_URL
core/security.py    — bcrypt password hashing, JWT create/decode, refresh token helpers
db/models.py        — User, RefreshToken (SQLModel / SQLite)
db/database.py      — engine, get_session() dependency, create_db_and_tables()
auth/schemas.py     — Pydantic request/response models
auth/service.py     — register_user, login_user, rotate_refresh_token, logout_user
auth/router.py      — POST /auth/register|login|refresh|logout, GET /auth/me
auth/dependencies.py— get_current_user FastAPI dependency (validates Bearer JWT)
main.py             — app wiring: CORS, lifespan (DB init), router inclusion
```

**Token rotation:** refresh tokens are stored as SHA-256 hashes in `RefreshToken` table. On `/auth/refresh` the old row is **deleted** and a new pair is issued. Reusing a rotated token returns 401.

### Frontend (`frontend/src/`)

```
theme/tokens.ts          — THE single design file: all CSS variable values for light + dark
theme/ThemeProvider.tsx  — injects CSS vars onto <html>, persists choice to localStorage
contexts/AuthContext.tsx — user state, access token (memory), refresh token (localStorage)
lib/api.ts               — typed fetch wrappers for all /auth/* endpoints
components/ui/           — Button, Input, Checkbox, FormField, Card, Spinner, ThemeToggle
components/layout/       — AuthLayout (centered card with logo for auth pages)
pages/                   — LoginPage, RegisterPage, HomePage
router/PrivateRoute.tsx  — redirects to /login if no user; shows Spinner while isLoading
router/AppRouter.tsx     — route table; redirects authed users away from /login and /register
```

**Theme system:** change colors/spacing/radius/shadows in `theme/tokens.ts` only — every component reads them via `var(--token-name)` CSS variables. No CSS-in-JS library. ThemeProvider applies the active token map to `document.documentElement` on mount and on toggle.

**Auth flow:** on app load, `AuthContext` checks localStorage for a refresh token and calls `/api/auth/refresh` to restore the session silently. Access token lives in React state (memory only); refresh token in localStorage.

## Notable config

- React Compiler (`babel-plugin-react-compiler`) is enabled in `vite.config.ts` — do not add manual `useMemo`/`useCallback`/`React.memo`.
- `verbatimModuleSyntax`: always `import type` for type-only imports.
- `erasableSyntaxOnly`: no `enum` — use `const` + `as const` instead.
- Python 3.12+; SQLite DB file at `backend/chess_mentor.db`.
