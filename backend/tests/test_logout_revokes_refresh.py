def test_logout_revokes_refresh(client, register):
    tokens = register(email="logout@example.com")
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}

    logout = client.post(
        "/auth/logout",
        json={"refresh_token": tokens["refresh_token"]},
        headers=headers,
    )
    assert logout.status_code == 204

    # The refresh token is gone after logout.
    res = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert res.status_code == 401
