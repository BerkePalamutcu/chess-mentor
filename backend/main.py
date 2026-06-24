from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth.router import router as auth_router
from core.config import FRONTEND_ORIGINS, settings
from core.errors import register_error_handlers
from db.database import create_db_and_tables
from puzzles.router import router as puzzles_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="Chess Mentor API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(auth_router)
app.include_router(puzzles_router)


if __name__ == "__main__":
    import uvicorn

    # Pass the app as an import string ("main:app") — required for `workers` to
    # take effect (uvicorn ignores workers when handed the app object directly).
    # workers and reload are mutually exclusive; this is the multi-process /
    # production-style entrypoint. For hot-reload during development use:
    #   uv run uvicorn main:app --reload
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        workers=settings.workers,
    )
