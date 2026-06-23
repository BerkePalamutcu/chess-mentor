def test_refresh_rotates_token(client, register):
    tokens = register(email="rot@example.com")
    res = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert res.status_code == 200
    new_tokens = res.json()
    # A brand-new pair is issued on every refresh.
    assert new_tokens["refresh_token"] != tokens["refresh_token"]
    assert new_tokens["access_token"]
