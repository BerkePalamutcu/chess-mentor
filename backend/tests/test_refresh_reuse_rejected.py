def test_refresh_reuse_rejected(client, register):
    tokens = register(email="reuse@example.com")
    # First use rotates (and deletes) the old token.
    first = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert first.status_code == 200
    # Reusing the now-rotated token must be rejected.
    second = client.post("/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert second.status_code == 401
    assert second.json()["detail"] == "Invalid refresh token"
