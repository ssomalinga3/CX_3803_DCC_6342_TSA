# Agent's Proposed Implementation Plan — First Task

Task: [first-task-gis-layers.md](./first-task-gis-layers.md)
Status: **Plan only. The agent stopped before implementing**, per the
Development Readiness assignment. The team reviews this plan before any code is
written.

## 1. Repository investigation (what the agent found)

- The repo is a pnpm workspace (`pnpm-workspace.yaml`) with members `mobile`,
  `backend`, and `packages/*`. `backend/` is now scaffolded: Express 5 + strict
  TypeScript (ESM), `src/app.ts` (app, no port) / `src/server.ts` (listener) /
  `src/config.ts` (env), a `/health` route, a structured 404 error envelope, and
  Jest + ts-jest + supertest with passing tests.
- Root scripts aggregate per-package checks recursively (`pnpm -r lint |
typecheck | test | test:ci`), matching [docs/workspace.md](../workspace.md).
  CI (`.github/workflows/ci.yml`) runs these on PRs and pushes to `main`.
- Authoritative specs reviewed: [architecture.md](../architecture.md) (GIS
  module → data access → PostGIS; Drizzle; boundaries), [api.md](../api.md)
  (proposed `/api/v1/layers` and `/features`, GeoJSON, structured errors),
  [data-model.md](../data-model.md) (`gis_layer`/`gis_feature`, SRID 4326,
  spatial indexes), [security.md](../security.md) (public read-only layers,
  no GPS in logs), and [decisions.md](../decisions.md) (D-05, D-12 constrain
  the GIS schema and data; stack is resolved).
- No database, ORM, or domain route exists yet. There is a clean seam to add
  routers and a data-access module onto `createApp()`.

## 2. Constraints the agent will honor

- Use pnpm + the single root lockfile; add backend deps via the backend package;
  no npm/Yarn lockfiles ([AGENTS.md](../../AGENTS.md)).
- Keep spatial SQL in data access; routes stay thin. Validate `bbox` at runtime.
- Ship **public layers only**; do not implement restricted-layer auth (D-02).
- Build on the S1 `gis_layer`/`gis_feature` model; do **not** adopt Jira's
  per-type tables until **D-12** is resolved. Record this assumption in the
  migration and README.
- Seed data is clearly placeholder; no real/authoritative GIS data (D-05).
- No credentials in source; connection string via env (`DATABASE_URL`).

## 3. Proposed steps

1. **Dependencies** — add to `backend`: `drizzle-orm`, `pg`; dev: `drizzle-kit`,
   `@types/pg`. Pin exact-ish versions consistent with existing style.
2. **Local database** — add `backend/docker-compose.yml` using the `postgis/postgis:16-*`
   image, exposing 5432, with a named volume. Document `docker compose up -d`.
   Add `DATABASE_URL` to `.env.example` (already placeholdered).
3. **Drizzle config + schema** — `drizzle.config.ts` and
   `src/db/schema.ts` defining `gis_layer` and `gis_feature` with a PostGIS
   `geometry(Geometry, 4326)` column and jsonb `properties`. Add a GiST index on
   `gis_feature.geometry` (via a custom SQL statement in the generated migration
   if drizzle-kit cannot express GiST directly).
4. **Migration scripts** — `db:generate`, `db:migrate`, `db:reset`, `db:seed` in
   `backend/package.json`. Generate the first migration. Add a seed script
   inserting a couple of public layers and a few sample features.
5. **Data access** — `src/db/client.ts` (pooled connection from `DATABASE_URL`)
   and `src/modules/gis/layers.repo.ts` with `listPublicLayers()` and
   `getPublicLayerFeatures(layerId, bbox?)`. Spatial filtering uses a
   parameterized `ST_Intersects(geometry, ST_MakeEnvelope(...,4326))`.
6. **Validation + types** — `src/modules/gis/types.ts` for shared layer/feature
   response shapes; a small `parseBbox()` that returns `400` on malformed input.
7. **Routes** — `src/modules/gis/layers.router.ts` mounting
   `GET /api/v1/layers` and `GET /api/v1/layers/:layerId/features`; convert rows
   to GeoJSON `FeatureCollection` with `[lng, lat]`; wire into `createApp()`
   before the 404 fallback.
8. **Tests** — supertest integration tests against a test database (CI service
   container or a disposable schema): list returns public-only; features return a
   valid FeatureCollection; bbox filters; invalid bbox → 400; non-public → 404;
   unknown id → 404. Add a repo-level test for the bbox SQL.
9. **CI** — add a PostGIS service container to the CI job and the
   `db:migrate`/`db:seed` steps before `test:ci` so integration tests run in CI.
10. **Docs** — update `backend/README.md` with database setup, migration, seed,
    and verify commands; note the D-12 assumption and public-only scope.

## 4. Interfaces affected

- New: GIS schema, migration, data-access module, GIS router, shared GeoJSON
  response types.
- Changed: `createApp()` (mount router), `backend/package.json` (deps + db
  scripts), `.env.example`, CI workflow, `backend/README.md`.
- Unchanged contracts: the proposed report payload and auth surfaces in api.md
  are untouched (deferred).

## 5. Verification plan

- `pnpm -r lint`, `pnpm -r typecheck`, `pnpm -r test:ci`, `pnpm backend:build`.
- Manual: `docker compose up`, migrate, seed, `curl /api/v1/layers` and
  `/features?bbox=...`.
- Security checks: non-public layer absent from both endpoints; no GPS/location
  or credentials in logs; `git diff --check` and final diff review.

## 6. Open questions for the team to resolve before implementation

1. **D-12**: Confirm building on `gis_layer`/`gis_feature` now, reconciling to
   any per-type tables later via migration. If the team wants the Jira
   per-type-table design first, the schema step changes materially.
2. **D-05**: Is placeholder seed data acceptable for this task, with real GIS
   ingestion tracked separately? What pillar values should the seed use?
3. **bbox semantics**: `ST_Intersects` vs fully-contained; and whether to cap
   result counts / add pagination now (api.md leaves bounds open).
4. **CI database**: PostGIS service container vs a lighter stub for integration
   tests — acceptable to add ~1 min to CI?
5. **Caching headers**: api.md says public layers "use caching headers" but
   leaves validators open — include basic `Cache-Control` now or defer?

## 7. Team review notes

> Fill in during the Go/No-Go Review: does this plan match our requirements and
> design? What would we change? Who owns which step? Record decisions in
> [decisions.md](../decisions.md) and update this file before implementation.
