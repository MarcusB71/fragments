# 404 test route that doesnt exist
GET http://localhost:8080/no-such-route

# We should get back a 404 response
HTTP/1.1 404