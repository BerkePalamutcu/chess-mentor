from fastapi import FastAPI
from fastapi.testclient import TestClient

from core.errors import register_error_handlers


def test_internal_error_handler():
    # A throwaway app with a route that raises an unexpected error.
    app = FastAPI()
    register_error_handlers(app)

    @app.get("/boom")
    def boom():
        raise RuntimeError("secret internal detail")

    client = TestClient(app, raise_server_exceptions=False)
    res = client.get("/boom")

    assert res.status_code == 500
    # The internal message must NOT leak; a generic string is returned.
    assert res.json() == {"detail": "Internal server error."}
