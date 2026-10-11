import { loadConfig } from '../src/config.js';

describe('loadConfig', () => {
  it('applies defaults when env vars are absent', () => {
    const config = loadConfig({});
    expect(config.nodeEnv).toBe('development');
    expect(config.port).toBe(3000);
  });

  it('reads provided values', () => {
    const config = loadConfig({ NODE_ENV: 'test', PORT: '4000' });
    expect(config.nodeEnv).toBe('test');
    expect(config.port).toBe(4000);
  });

  it('throws on an invalid port', () => {
    expect(() => loadConfig({ PORT: 'not-a-number' })).toThrow(/Invalid PORT/);
    expect(() => loadConfig({ PORT: '70000' })).toThrow(/Invalid PORT/);
  });
});
