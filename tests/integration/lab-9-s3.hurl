# tests/integration/post-fragments.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Hello S3!`

# 1. Response
HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"

[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "Hello S3!"

# 3. Try to DELETE the fragment we just got
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# 4. Try to GET the fragment we just deleted
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404