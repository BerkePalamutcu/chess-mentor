def test_change_password_too_short(client, register):
    tokens = register(email="pw@example.com", password="password123")
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    res = client.patch(
        "/auth/password",
        json={"current_password": "password123", "new_password": "short"},
        headers=headers,
    )
    assert res.status_code == 422
    assert "at least 8 characters" in res.json()["detail"]
