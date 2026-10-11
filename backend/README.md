# Backend

Node.js + TypeScript REST API server for Cascade Springs. This package is the
server application described in [docs/architecture.md](../docs/architecture.md):
a single server with separate GIS, reporting, and data-access responsibilities
(not a microservice deployment). The API contract is in
[docs/api.md](../docs/api.md); the schema is in
[docs/data-model.md](../docs/data-model.md); privacy and access rules are in
[docs/security.md](../docs/security.md).

> **Scaffold scope.** This package currently exposes only an operational
> `/health` endpoint plus app/server separation and the test, lint, and type
> toolchain. The domain surface (layers, observations) and the Drizzle/PostGIS
> data layer are deferred to the first implementation task so that open
> decisions (see [docs/decisions.md](../docs/decisions.md), notably D-01, D-03,
> and D-12) are not pre-empted in code.

## Stack

- Node.js 24 (pinned in root [`.nvmrc`](../.nvmrc) and root `package.json` engines)
- TypeScript (strict), ESM modules
- Express 5 for HTTP
- Jest + ts-jest + supertest for tests
- ESLint 9 (flat config) + typescript-eslint; Prettier is run from the repo root

Planned additions (not yet installed): Drizzle ORM + PostgreSQL/PostGIS data
access, S3 image storage, and an SES email adapter.

## Prerequisites

Use pnpm (via Corepack) from the repository root. Do not create an npm or Yarn
lockfile; the workspace maintains a single root `pnpm-lock.yaml`.

```bash
corepack enable
```

## Install

Install from the workspace root so the shared lockfile stays authoritative:

```bash
pnpm install
```

## Run

```bash
# From the repo root:
pnpm backend:dev     # watch mode (tsx)
pnpm backend:start   # run compiled output (after backend:build)

# Or from this directory:
pnpm dev
pnpm build && pnpm start
```

Then check the health endpoint:

```bash
curl http://localhost:3000/health
# { "status": "ok", "uptime": ..., "timestamp": "..." }
```

## Verify

The root aggregates these script names across workspace packages. From the repo
root:

```bash
pnpm -r lint        # ESLint, zero warnings allowed
pnpm -r typecheck   # tsc --noEmit
pnpm -r test:ci     # Jest with coverage
pnpm format:check   # Prettier (root-wide)
```

Or run them directly in this package:

```bash
pnpm lint
pnpm typecheck
pnpm test        # or: pnpm test:ci
```

## Configuration

Copy [`.env.example`](./.env.example) to `.env` for local overrides. `.env`
files are gitignored. Credentials must come from the environment or managed
secrets and must never be committed (see
[docs/security.md](../docs/security.md)).

## Layout

```
backend/
├── src/
│   ├── app.ts       # Express app (no port binding) — testable with supertest
│   ├── server.ts    # HTTP listener + graceful shutdown
│   └── config.ts    # Environment-driven configuration
└── test/
    ├── health.test.ts
    └── config.test.ts
```
