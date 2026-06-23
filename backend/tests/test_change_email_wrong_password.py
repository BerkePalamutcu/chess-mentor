def test_change_email_wrong_password(client, register):
    tokens = register(email="old@example.com", password="password123")
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    res = client.patch(
        "/auth/email",
        json={"email": "new@example.com", "password": "wrongpassword"},
        headers=headers,
    )
    assert res.status_code == 401
    assert res.json()["detail"] == "Incorrect password"
