/**
 * Runtime configuration derived from environment variables.
 *
 * Credentials (database, AWS, SMTP) are intentionally NOT read here yet. Per
 * docs/security.md they must come from the environment or managed secrets and
 * never be committed. They will be added alongside the data-access and
 * reporting modules once D-01/D-03/D-10 are resolved.
 */

function parsePort(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === '') {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 65535) {
    throw new Error(`Invalid PORT value: ${value}`);
  }
  return parsed;
}

export interface AppConfig {
  readonly nodeEnv: string;
  readonly port: number;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    nodeEnv: env.NODE_ENV ?? 'development',
    port: parsePort(env.PORT, 3000),
  };
}
