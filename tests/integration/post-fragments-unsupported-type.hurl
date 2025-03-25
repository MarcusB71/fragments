# tests/integration/post-fragments-unsupported-type.hurl
POST http://localhost:8080/v1/fragments
# We're sending an unsupported type fragment
Content-Type: unsupported/nogood
[BasicAuth]
user1@email.com:password1
`This is a fragment!`

# 1. Response
HTTP/1.1 415
