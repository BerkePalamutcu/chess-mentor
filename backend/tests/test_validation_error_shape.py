def test_validation_error_shape(client):
    # Missing both email and password — multiple field errors are flattened
    # into one readable string (not FastAPI's default list of objects).
    res = client.post("/auth/register", json={"name": "Ada"})
    assert res.status_code == 422
    detail = res.json()["detail"]
    assert isinstance(detail, str)
    assert "email" in detail
    assert "password" in detail
    assert ";" in detail  # the two field errors are joined
