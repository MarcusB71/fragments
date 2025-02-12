// tests/unit/post.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  const validUser = { email: 'user1@email.com', password: 'password1' };

  test('unauthenticated requests are denied', () =>
    request(app).post('/v1/fragments').send('Test fragment').expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .send('Test fragment')
      .expect(401));

  test('authenticated users can create a fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(validUser.email, validUser.password)
      .set('Content-Type', 'text/plain')
      .send('This is a test fragment.');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment.id).toBeDefined();
    expect(res.body.fragment.type).toBe('text/plain');
  });

  test('rejects unsupported content types', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(validUser.email, validUser.password)
      .set('Content-Type', 'application/xml')
      .send('XML is not supported');

    expect(res.statusCode).toBe(415);
    expect(res.body.error.message).toMatch('Invalid content type');
  });
});
