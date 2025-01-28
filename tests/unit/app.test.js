// tests/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('Non-existing pages', () => {
  // If route does not exist, it should return a 404 error
  test('acessing routes that do not exist returns 404', () =>
    request(app).get('/ROUTETHATDOESNOTEXIST').expect(404));
});
