def test_register_short_password(client):
    res = client.post(
        "/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "short"},
    )
    assert res.status_code == 422
    # The error handler normalizes validation errors to a single string.
    detail = res.json()["detail"]
    assert isinstance(detail, str)
    assert "at least 8 characters" in detail
