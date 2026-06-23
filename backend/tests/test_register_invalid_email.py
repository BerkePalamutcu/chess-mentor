def test_register_invalid_email(client):
    res = client.post(
        "/auth/register",
        json={"name": "Ada", "email": "not-an-email", "password": "password123"},
    )
    assert res.status_code == 422
    detail = res.json()["detail"]
    assert isinstance(detail, str)
    assert "email" in detail.lower()
