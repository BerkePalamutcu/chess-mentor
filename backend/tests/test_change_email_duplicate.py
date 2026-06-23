def test_change_email_duplicate(client, register):
    register(email="taken@example.com")
    tokens = register(email="mine@example.com", password="password123")
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    res = client.patch(
        "/auth/email",
        json={"email": "taken@example.com", "password": "password123"},
        headers=headers,
    )
    assert res.status_code == 409
    assert res.json()["detail"] == "Email already registered"
