# tests/integration/post-fragments-unauthenticated.hurl
# unauthenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
fake@email.com:incorrectPW
`This is a fragment!`

# 1. Response
HTTP/1.1 401
