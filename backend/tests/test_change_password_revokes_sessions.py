def test_change_password_revokes_sessions(client, register):
    tokens = register(email="pw@example.com", password="password123")
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    res = client.patch(
        "/auth/password",
        json={"current_password": "password123", "new_password": "newpassword456"},
        headers=headers,
    )
    assert res.status_code == 204

    # Changing the password revokes existing refresh tokens.
    refresh = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert refresh.status_code == 401
