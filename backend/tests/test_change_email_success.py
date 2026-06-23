def test_change_email_success(client, register):
    tokens = register(email="old@example.com", password="password123")
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    res = client.patch(
        "/auth/email",
        json={"email": "new@example.com", "password": "password123"},
        headers=headers,
    )
    assert res.status_code == 200
    assert res.json()["email"] == "new@example.com"

    # The new email can be used to log in.
    login = client.post("/auth/login", json={"email": "new@example.com", "password": "password123"})
    assert login.status_code == 200
