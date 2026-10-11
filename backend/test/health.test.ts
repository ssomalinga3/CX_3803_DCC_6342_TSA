import request from 'supertest';
import { createApp } from '../src/app.js';

describe('GET /health', () => {
  const app = createApp();

  it('returns 200 with an ok status payload', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok' });
    expect(typeof response.body.uptime).toBe('number');
    expect(typeof response.body.timestamp).toBe('string');
  });
});

describe('unknown routes', () => {
  const app = createApp();

  it('returns a 404 with the structured error envelope', async () => {
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: 'NOT_FOUND' },
    });
  });
});
