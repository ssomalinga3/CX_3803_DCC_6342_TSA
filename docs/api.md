# API and interfaces

Baseline transport: S1 pp. 9 and 12. Required workflows: S3 stories 1–3 and 6–10. S1 does not specify URL paths, payload field names, error envelopes, or authentication transport. The HTTP shape below is **proposed**, to be finalized with D-01–D-07 before client/server implementation.

Use [J6-13](https://gatech-team-f1s41wh9.atlassian.net/browse/J6-13) for trail/boundary/landmark GeoJSON endpoints and [J6-18](https://gatech-team-f1s41wh9.atlassian.net/browse/J6-18) for cached read-only layer catalog/features. Reporting must support the existing [Figma recipient/review flow](https://www.figma.com/design/zotPKNdYIDv72Bc1mc57CQ/mid-fidelity-prototype?node-id=66-260), including multiple explicitly listed recipients and recoverable validation failures; its payload and authorization rules still require D-03.

## Required interface behavior

| Boundary | Baseline contract |
| --- | --- |
| Mobile → GIS API | HTTPS GET; layer/trail data as GeoJSON or vector tiles; public read-only layers use caching headers |
| Mobile → reporting API | HTTPS POST using `multipart/form-data`, containing report text/metadata and JPEG/PNG file(s) |
| GIS/reporting → data access | Drizzle operations and parameterized spatial SQL over the [source entities](data-model.md) |
| Reporting → S3 | Upload validated/sanitized images into private object storage; retain stable references |
| Reporting → email adapter → SES | Route using category/recipient configuration; authenticated SMTP notification |
| Staff UI → API | Authorized report filtering by pillar, category, status, date; status updates and exports |

## Proposed HTTP surface

| Method/path | Input and result | Access |
| --- | --- | --- |
| `GET /api/v1/layers` | Optional pillar/type filters; return accessible layer metadata | Public results limited to `is_public=true`; restricted access policy open |
| `GET /api/v1/layers/{layerId}/features` | Optional `bbox=west,south,east,north`; return a GeoJSON `FeatureCollection` | Same access check as parent layer |
| `GET /api/v1/layers/{layerId}/tiles/{z}/{x}/{y}` | Vector tile for a published tiled layer | Same access check as parent layer |
| `GET /api/v1/report-options` | Return approved categories and allowed reporting choices | Follows reporting authentication policy; exclude private recipient details |
| `POST /api/v1/observations` | Multipart metadata plus `images`; return server observation ID and status | Reporter identity policy open; no client-assigned role/status |
| `GET /api/v1/observations` | Staff filters; proposed owner filter for personal report history | Staff or owner scope, enforced by server |
| `GET /api/v1/observations/{id}` | Authorized report detail and temporary media access | Staff or owner scope; public report visibility unresolved |
| `PATCH /api/v1/observations/{id}` | Authorized status/recipient changes; return saved report | Authorized Conservancy staff only |
| `GET /api/v1/observations/export` | Export authorized filtered records | Authorized staff; format and researcher permissions open |

Static export routing must be distinguished from `/{id}` if these paths are adopted. History and safety data delivery remain open in D-05; they may use GIS feature properties or dedicated content interfaces. Authentication endpoints cannot be finalized until D-01 is resolved.

## Proposed report payload and processing

Use a JSON `metadata` multipart field containing `client_submission_id`, `category_id`, a GeoJSON Point `location`, capture time `captured_at`, and optional `note`, plus one or more `images` parts. The client submission ID and report-level capture time extend the source ER model and need migrations. Server receipt time and capture time must remain distinct when sending queued reports.

1. Validate identity/access policy, category, coordinates, text, and actual image content/size. Derive reporter identity from the authenticated context if authentication is required.
2. Resolve the permitted destination from server configuration. Default routing is category-based. Custom/self-routing is a source requirement, but its contract and allowed recipients await D-03; do not accept arbitrary destinations as an implicit default.
3. Save sanitized images and the observation/image records. Define recovery for partial S3/database failure; no success response may represent an incomplete accepted report.
4. Return the accepted report identity and status. Trigger a notification for the selected recipient. A stored report and a delivered email are different outcomes; email delivery failure must not silently lose the report.
5. Reconcile retried offline submissions without duplicate observations. Proposed implementation: scope a stable client submission ID to the reporter, enforce uniqueness, return the original result for identical retries, and reject conflicting reuse. D-07 must also define notification retries so report retries do not multiply emails.

## Proposed response rules

Use `201` for first creation, `200` for a recognized identical replay/read/update, and `304` for valid conditional GIS requests. Return a structured error such as `{"error":{"code":"INVALID_REPORT","message":"…","fields":{}}}`. Distinguish invalid input (`400`), unauthenticated (`401`), forbidden (`403`), missing resource (`404`), conflicting replay/state (`409`), oversized upload (`413`), unsupported media (`415`), and temporary server failure (`5xx`).

The client retains a queued report until server acceptance is confirmed. Retry temporary connection/server failures; preserve validation failures for correction and expired-authorization failures for sign-in. Exact retry limits, pagination, payload bounds, cache validators, and export format are open. These examples are a proposed contract, not an existing API.
