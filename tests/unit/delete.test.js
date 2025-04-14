const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments/:id', () => {
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
    const res = await request(app).delete(`/v1/fragments/${fragmentId}`);
    expect(res.statusCode).toBe(401);
  });
  test('incorrect credentials are denied', async () => {
    const res = await request(app)
      .delete(`/v1/fragments/${fragmentId}`)
      .auth('wrong@email.com', 'wrongpassword');
    expect(res.statusCode).toBe(401);
  });
  test('incorrect fragmentId returns not found', async () => {
    const res = await request(app)
      .delete(`/v1/fragments/1234512345`)
      .auth(validUser.email, validUser.password);
    expect(res.statusCode).toBe(404);
  });
  test('correct fragmentId and auth deletes fragment', async () => {
    const res = await request(app)
      .delete(`/v1/fragments/${fragmentId}`)
      .auth(validUser.email, validUser.password);
    expect(res.statusCode).toBe(200);
  });
});
