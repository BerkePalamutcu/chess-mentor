def test_me_invalid_token(client):
    res = client.get("/auth/me", headers={"Authorization": "Bearer not.a.real.token"})
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid or expired token"
