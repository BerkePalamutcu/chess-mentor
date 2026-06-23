def test_me_success(client, auth_headers):
    headers = auth_headers(name="Grace", email="grace@example.com")
    res = client.get("/auth/me", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["email"] == "grace@example.com"
    assert body["name"] == "Grace"
    assert "hashed_password" not in body
