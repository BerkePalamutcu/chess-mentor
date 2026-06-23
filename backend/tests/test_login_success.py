def test_login_success(client, register):
    register(email="login@example.com", password="password123")
    res = client.post(
        "/auth/login",
        json={"email": "login@example.com", "password": "password123"},
    )
    assert res.status_code == 200
    assert res.json()["access_token"]
