def test_delete_account_wrong_password(client, register):
    tokens = register(email="stay@example.com", password="password123")
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    res = client.request(
        "DELETE",
        "/auth/account",
        json={"password": "wrongpassword"},
        headers=headers,
    )
    assert res.status_code == 401
    assert res.json()["detail"] == "Incorrect password"

    # The account still exists.
    login = client.post("/auth/login", json={"email": "stay@example.com", "password": "password123"})
    assert login.status_code == 200
