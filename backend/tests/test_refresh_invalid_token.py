def test_refresh_invalid_token(client):
    res = client.post("/auth/refresh", json={"refresh_token": "garbage-token"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid refresh token"
