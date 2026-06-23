"""Centralized error handling.

Every error the API returns is normalized to a single shape so the frontend can
rely on it unconditionally:

    {"detail": "<human-readable message>"}

- HTTPException already carries a string ``detail`` — passed through unchanged.
- RequestValidationError (422) is flattened from FastAPI's list-of-objects into a
  single readable sentence (the raw list was leaking to the client as ``detail``).
- Any uncaught exception becomes a generic 500 so internal details / stack traces
  never reach the client. The real error is logged server-side.
"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("chess_mentor.errors")


def _error_response(status_code: int, detail: str) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"detail": detail})


def _format_validation_error(exc: RequestValidationError) -> str:
    """Turn FastAPI's structured validation errors into one readable sentence."""
    messages: list[str] = []
    for err in exc.errors():
        msg = err.get("msg", "Invalid value")
        # Drop pydantic's "Value error, " prefix for custom validators.
        msg = msg.removeprefix("Value error, ")
        loc = [str(p) for p in err.get("loc", ()) if p not in ("body", "query", "path")]
        field = ".".join(loc)
        messages.append(f"{field}: {msg}" if field else msg)
    if not messages:
        return "Invalid request."
    # De-duplicate while preserving order, then join.
    seen: set[str] = set()
    unique = [m for m in messages if not (m in seen or seen.add(m))]
    return "; ".join(unique)


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(_: Request, exc: StarletteHTTPException):
        detail = exc.detail if isinstance(exc.detail, str) else "Request failed."
        return _error_response(exc.status_code, detail)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(_: Request, exc: RequestValidationError):
        return _error_response(422, _format_validation_error(exc))

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled error on %s %s", request.method, request.url.path, exc_info=exc)
        return _error_response(status.HTTP_500_INTERNAL_SERVER_ERROR, "Internal server error.")
