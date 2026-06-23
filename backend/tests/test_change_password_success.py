def test_change_password_success(client, register):
    tokens = register(email="pw@example.com", password="password123")
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    res = client.patch(
        "/auth/password",
        json={"current_password": "password123", "new_password": "newpassword456"},
        headers=headers,
    )
    assert res.status_code == 204

    # Old password no longer works; the new one does.
    assert client.post("/auth/login", json={"email": "pw@example.com", "password": "password123"}).status_code == 401
    assert client.post("/auth/login", json={"email": "pw@example.com", "password": "newpassword456"}).status_code == 200
