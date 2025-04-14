const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
  const validUser = { email: 'user1@email.com', password: 'password1' };
  let fragmentId;
  // Create a markdown fragment before tests run
  beforeEach(async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(validUser.email, validUser.password)
      .set('Content-Type', 'text/markdown')
      .send('# Markdown Fragment\nThis is a test.');

    fragmentId = res.body.fragment.id;
  });

  test('unauthenticated requests are denied', async () => {
    const res = await request(app).put(`/v1/fragments/${fragmentId}`);
    expect(res.statusCode).toBe(401);
  });
  test('incorrect credentials are denied', async () => {
    const res = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth('wrong@email.com', 'wrongpassword');
    expect(res.statusCode).toBe(401);
  });
  test('incorrect fragment type returns 400 error', async () => {
    const content = 'Updated fragment content';
    const contentType = 'text/html';
    const res = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(validUser.email, validUser.password)
      .set('Content-Type', contentType)
      .send(content);
    expect(res.statusCode).toBe(400);
  });
  test('incorrect fragmentId returns not found', async () => {
    const content = 'Updated fragment content';
    const contentType = 'text/markdown';
    const res = await request(app)
      .put(`/v1/fragments/1234512345`)
      .auth(validUser.email, validUser.password)
      .set('Content-Type', contentType)
      .send(content);
    expect(res.statusCode).toBe(404);
  });
  test('correct fragmentId and auth updates fragment', async () => {
    const content = 'Updated fragment content';
    const contentType = 'text/markdown';
    const res = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth(validUser.email, validUser.password)
      .set('Content-Type', contentType)
      .send(content);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
