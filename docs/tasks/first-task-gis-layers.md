# First Implementation Task — Database Foundation + Public GIS Layer Read API

Status: Proposed for the Go/No-Go Review. Not yet implemented.

Jira: [J6-13](https://gatech-team-f1s41wh9.atlassian.net/browse/J6-13) (trail/boundary/landmark GeoJSON endpoints),
[J6-17](https://gatech-team-f1s41wh9.atlassian.net/browse/J6-17) (layer schema),
[J6-18](https://gatech-team-f1s41wh9.atlassian.net/browse/J6-18) (cached read-only layer catalog/features).

## Why this task first

This is the first task from Global Setup & Infrastructure. It stands up the
shared backend foundation that nearly everything else depends on — a running
PostgreSQL/PostGIS database, Drizzle schema + migration tooling, and a
data-access → GIS module → REST path — while staying inside the parts of the
spec that are **already decided**:

- The map read path is baseline (S1 pp. 9, 12; [architecture.md](../architecture.md) interaction 1).
- Public GIS layers are read-only and public (S1; [security.md](../security.md) access table).
- The stack (PostgreSQL + PostGIS + Drizzle, Node + TypeScript) is a resolved
  decision ([decisions.md](../decisions.md) resolved direction).

It deliberately avoids the reporting/auth surface, which is blocked by open
decisions D-01 (auth/guest ownership), D-03 (recipients), and D-07 (offline
queue/dedup). It gives the mobile team a real endpoint to render the map
against and gives the backend a migration/test pattern to reuse.

## Scope (in)

1. **Database + tooling**
   - Add PostgreSQL 16 + PostGIS to local development via Docker Compose.
   - Add Drizzle ORM + drizzle-kit with migration generate/apply scripts.
   - Document database setup, migration, and reset commands in `backend/README.md`.
2. **Schema (first migration)**
   - Implement the `gis_layer` and `gis_feature` tables from
     [data-model.md](../data-model.md), using PostGIS `geometry` with **SRID 4326**.
   - Add a GiST spatial index on `gis_feature.geometry`.
   - Keep flexible attributes in `gis_feature.properties` (jsonb).
3. **Seed data**
   - Add a small, non-authoritative seed (a few public layers + sample features)
     so the endpoints return data in development and tests. Seed data is clearly
     labeled as placeholder, not real preserve GIS data.
4. **Data access**
   - A `layers` data-access module: list public layers; fetch features for a
     layer, optionally filtered by `bbox=west,south,east,north`.
   - All spatial SQL stays in this layer (per [AGENTS.md](../../AGENTS.md) and
     architecture boundaries). Queries are parameterized.
5. **GIS module + routes**
   - `GET /api/v1/layers` — returns accessible layer metadata, **limited to
     `is_public = true`**.
   - `GET /api/v1/layers/{layerId}/features` — returns a GeoJSON
     `FeatureCollection`; supports optional `bbox`; applies the same public
     access check as the parent layer; `404` for unknown/non-public layer.
   - Coordinates emitted as **[longitude, latitude]**.
   - Errors use the structured envelope already scaffolded in `app.ts`
     (`{ "error": { "code", "message", "fields" } }`), with `400` for an
     invalid `bbox`.
6. **Shared contract types**
   - Define the layer/feature response TypeScript types so the client and
     server can share them, validating input at runtime (per architecture
     "Implementation boundaries").
7. **Tests**
   - Integration tests (supertest) for both endpoints against a test database:
     success, bbox filtering, invalid bbox → 400, non-public layer excluded,
     unknown layer → 404.

## Scope (out — explicitly deferred)

- Vector tile endpoint `/tiles/{z}/{x}/{y}` (can follow once the base read path lands).
- Any observation/reporting endpoints, image upload, S3, SES.
- Authentication, staff roles, non-public layer access policy — **open in D-01/D-02**.
- Physical GIS table reconciliation (`trails`/`landmarks`/etc.) — **open in D-12**.
  This task uses the S1 `gis_layer`/`gis_feature` model and must not silently
  adopt the Jira per-type-table design before D-12 is resolved.
- Pillar/property schemas and the real GIS dataset — **open in D-05**.
- Caching header policy specifics and cache validators — open in api.md.

## Dependencies and decisions to confirm before/within the task

- **D-12** (physical GIS schema): the team must confirm that building against
  `gis_layer`/`gis_feature` now — with migrations as the reconciliation point
  later — is acceptable. This task assumes yes and documents it.
- **D-05** (datasets, pillars, CRS/provenance): seed data is placeholder only;
  real ingestion is out of scope.
- **D-02** (non-public layer access): this task ships **public layers only**;
  restricted-layer authorization is not implemented.

## Acceptance criteria

- [ ] `docker compose up` (or documented equivalent) starts PostgreSQL + PostGIS locally.
- [ ] `pnpm --dir backend db:generate` and `db:migrate` create the `gis_layer`
      and `gis_feature` tables with SRID 4326 geometry and a GiST index on
      `gis_feature.geometry`.
- [ ] A documented seed command populates sample public layers and features.
- [ ] `GET /api/v1/layers` returns only `is_public = true` layers as JSON.
- [ ] `GET /api/v1/layers/{layerId}/features` returns a valid GeoJSON
      `FeatureCollection` with `[lng, lat]` coordinates.
- [ ] `bbox` filtering returns only features intersecting the box; an invalid
      `bbox` returns `400` with the structured error envelope.
- [ ] A non-public layer is excluded from `/layers` and returns `404` from
      `/features`; an unknown `layerId` returns `404`.
- [ ] Spatial SQL lives only in the data-access module; routes/handlers contain
      no raw SQL; all queries are parameterized.
- [ ] Shared response types exist and runtime validation rejects malformed `bbox`.
- [ ] New integration tests cover the cases above and pass under `pnpm -r test:ci`.
- [ ] `pnpm -r lint`, `pnpm -r typecheck`, and `pnpm -r test:ci` all pass; the
      backend builds with `pnpm backend:build`.
- [ ] `backend/README.md` documents the new database setup, migration, seed, and
      run/verify commands. No credentials are committed.

## Verification (maps to AGENTS.md "Testing & Verification")

- Run lint, typecheck, tests, and build.
- Confirm the public-only access rule from [security.md](../security.md): a
  non-public layer must not appear in list or feature responses.
- Confirm GPS/location values and credentials never appear in server logs.
- Review the final diff and run `git diff --check`.
