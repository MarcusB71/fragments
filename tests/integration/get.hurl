# Health Check Test
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

# We should get back an HTTP 1.1 200 response
HTTP/1.1 200
