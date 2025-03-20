// tests/unit/get.test.js

const request = require('supertest');
const { writeFragment, writeFragmentData } = require('../../src/model/data/memory');
const app = require('../../src/app');
const hash = require('../../src/hash');
const { Fragment } = require('../../src/model/fragment');

describe('GET /v1/fragments', () => {
  const validUser = { email: 'user1@email.com', password: 'password1' };
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));
  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // If the user has no fragments, the response should contain an empty array
  test('authenticated users with no fragments should get an empty array', async () => {
    // Assuming no fragments exist for the valid user
    const res = await request(app).get('/v1/fragments').auth(validUser.email, validUser.password);

    expect(res.statusCode).toBe(200);
    expect(res.body.fragments).toEqual([]); // Empty array when no fragments exist
  });
  test('authenticated users get an expanded fragments array', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth(validUser.email, validUser.password);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // Validate the structure of the fragments array (this assumes fragments have properties like `id` and `type`)
  test('fragments should have the correct structure', async () => {
    const res = await request(app).get('/v1/fragments').auth(validUser.email, validUser.password);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.fragments)).toBe(true);

    if (res.body.fragments.length > 0) {
      res.body.fragments.forEach((fragment) => {
        expect(fragment).toHaveProperty('id');
        expect(fragment).toHaveProperty('type');
        expect(fragment.type).toBe('text/plain'); // Assuming all fragments are of type text/plain
      });
    }
  });
});

describe('GET /v1/fragments/:id', () => {
  const validUser = { email: 'user1@email.com', password: 'password1' };
  const fragmentId = '123';
  const ownerId = 'user123';
  const fragmentData = { id: fragmentId, ownerId, type: 'text/plain', size: 100 };
  const fragmentBuffer = Buffer.from('This is test fragment data');

  beforeEach(async () => {
    // Ensure fresh state for each test
    await writeFragment(fragmentData);
    await writeFragmentData(ownerId, fragmentId, fragmentBuffer);
  });

  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get(`/v1/fragments/${fragmentId}`).expect(401));
  test('incorrect credentials are denied', () =>
    request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));
  test('return specific fragment data without post request', async () => {
    const ownerId = hash('user1@email.com');
    const id = 'randomId';
    const fragMetadata1 = new Fragment({ id: id, ownerId: ownerId, type: 'text/plain' });
    const body = 'Fragment sample';
    fragMetadata1.setData(body);
    fragMetadata1.save();
  });
  test('authenticated user return specific fragment data', async () => {
    const ownerId = hash('user1@email.com');
    const id = 'randomId';
    const fragMetadata1 = new Fragment({ id: id, ownerId: ownerId, type: 'text/plain' });
    const body = 'Fragment sample';
    fragMetadata1.setData(body);
    fragMetadata1.save();
    const res = await request(app).get(`/v1/fragments/${id}`).auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Fragment sample');
  });
  test('returns 500 if there is a server error fetching the fragment', async () => {
    const res = await request(app)
      .get(`/v1/fragments/1234121231412`)
      .auth(validUser.email, validUser.password);

    expect(res.statusCode).toBe(500);
    expect(res.body.error.message).toMatch('Internal Server Error');
  });
});

describe('GET /v1/fragments/:id(.ext)', () => {
  const validUser = { email: 'user1@email.com', password: 'password1' };
  let fragmentId;
  // Create a markdown fragment before tests run
  beforeAll(async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(validUser.email, validUser.password)
      .set('Content-Type', 'text/markdown')
      .send('# Markdown Fragment\nThis is a test.');

    fragmentId = res.body.fragment.id;
  });
  test('unauthenticated requests are denied', async () => {
    const res = await request(app).get(`/v1/fragments/${fragmentId}.md`);
    expect(res.statusCode).toBe(401);
  });
  test('incorrect credentials are denied', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.md`)
      .auth('wrong@email.com', 'wrongpassword');
    expect(res.statusCode).toBe(401);
  });
  test('fetch raw markdown fragment', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.md`)
      .auth(validUser.email, validUser.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/markdown');
    expect(res.text).toContain('# Markdown Fragment');
  });
  test('unsupported extension returns 415', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.invalid`)
      .auth(validUser.email, validUser.password);

    expect(res.statusCode).toBe(415);
  });
  test('fetch fragment without extension returns raw data', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth(validUser.email, validUser.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/markdown');
    expect(res.text).toContain('# Markdown Fragment');
  });
  test('converting: md => html', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth(validUser.email, validUser.password);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('<h1>Markdown Fragment</h1>');
  });
  test('converting: html => html', async () => {
    const data = '<h1>This is HTML</h1>';

    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/html')
      .send(data);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.html`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('text/html');
    expect(res.text).toBe('<h1>This is HTML</h1>');
  });
  test('converting: json => json', async () => {
    const data = {
      content: 'This is JSON',
    };
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'application/json')
      .send(data);
    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.json`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('application/json');
    expect(res.body).toEqual({ content: 'This is JSON' });
  });
  test('converting: json => txt', async () => {
    const data = {
      content: 'This is JSON',
    };
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'application/json')
      .send(data);

    const res = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.txt`)
      .auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain('text/plain');
    expect(res.text).toBe('{"content":"This is JSON"}');
  });
});
