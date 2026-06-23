def test_delete_account_success(client, register):
    tokens = register(email="bye@example.com", password="password123")
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    res = client.request(
        "DELETE",
        "/auth/account",
        json={"password": "password123"},
        headers=headers,
    )
    assert res.status_code == 204

    # The account is gone — login no longer succeeds.
    login = client.post("/auth/login", json={"email": "bye@example.com", "password": "password123"})
    assert login.status_code == 401
