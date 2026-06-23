"""Shared pytest fixtures.

Each test case lives in its own file (per project convention); the reusable
wiring — an isolated in-memory database and a TestClient — lives here so the
case files stay focused on a single assertion.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

import main
from db.database import get_session


@pytest.fixture
def client():
    """A TestClient backed by a fresh in-memory SQLite database per test.

    StaticPool keeps the single in-memory connection alive across requests so
    schema and rows persist for the duration of the test. The app's get_session
    dependency is overridden to use this engine; the real file DB is untouched.

    Note: TestClient is intentionally not used as a context manager so the app's
    lifespan (which would create tables on the real file engine) does not run.
    """
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    def override_get_session():
        with Session(engine) as session:
            yield session

    main.app.dependency_overrides[get_session] = override_get_session
    try:
        yield TestClient(main.app)
    finally:
        main.app.dependency_overrides.clear()
        engine.dispose()


@pytest.fixture
def register(client):
    """Register a user and return the auth token payload."""

    def _register(name="Tester", email="tester@example.com", password="password123"):
        res = client.post(
            "/auth/register",
            json={"name": name, "email": email, "password": password},
        )
        assert res.status_code == 201, res.text
        return res.json()

    return _register


@pytest.fixture
def auth_headers(register):
    """Register a user and return ready-to-use Authorization headers."""

    def _auth_headers(**kwargs):
        tokens = register(**kwargs)
        return {"Authorization": f"Bearer {tokens['access_token']}"}

    return _auth_headers
