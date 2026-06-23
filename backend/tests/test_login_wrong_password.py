def test_login_wrong_password(client, register):
    register(email="login@example.com", password="password123")
    res = client.post(
        "/auth/login",
        json={"email": "login@example.com", "password": "wrongpassword"},
    )
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid credentials"
