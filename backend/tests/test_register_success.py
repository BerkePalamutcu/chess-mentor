def test_register_success(client):
    res = client.post(
        "/auth/register",
        json={"name": "Ada", "email": "ada@example.com", "password": "password123"},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["token_type"] == "bearer"
