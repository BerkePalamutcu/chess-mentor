def test_me_requires_auth(client):
    # No Authorization header — the request is rejected before the handler runs.
    res = client.get("/auth/me")
    assert res.status_code == 401
    # Even the auto-generated auth error is normalized to a string detail.
    assert isinstance(res.json()["detail"], str)
