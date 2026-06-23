def test_register_duplicate_email(client, register):
    register(email="dupe@example.com")
    res = client.post(
        "/auth/register",
        json={"name": "Other", "email": "dupe@example.com", "password": "password123"},
    )
    assert res.status_code == 409
    assert res.json()["detail"] == "Email already registered"
