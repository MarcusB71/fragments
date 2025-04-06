# tests/integration/post-fragments-json.hurl
# Authenticated JSON POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a json fragment
Content-Type: application/json
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
{
  "fName": "Marcus",
  "lName": "Brown"
}

# 1. Response
HTTP/1.1 201

[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"


[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json
[Asserts]
jsonpath "$.fName" == "Marcus"
jsonpath "$.lName" == "Brown"