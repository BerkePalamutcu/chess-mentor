def test_change_password_wrong_current(client, register):
    tokens = register(email="pw@example.com", password="password123")
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    res = client.patch(
        "/auth/password",
        json={"current_password": "wrongpassword", "new_password": "newpassword456"},
        headers=headers,
    )
    assert res.status_code == 401
    assert res.json()["detail"] == "Current password is incorrect"
