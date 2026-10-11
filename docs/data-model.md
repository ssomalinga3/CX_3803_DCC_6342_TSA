# Data model

Baseline: S1 pp. 10–12, including Figure 2. Names/types below transcribe that ER diagram; physical migrations have not been created. `PK` means primary key and `FK` means foreign key.

Implementation references: [J6-12 spatial tables/indexes](https://gatech-team-f1s41wh9.atlassian.net/browse/J6-12), [J6-17 layer schema](https://gatech-team-f1s41wh9.atlassian.net/browse/J6-17), and [J6-22 trail geometry](https://gatech-team-f1s41wh9.atlassian.net/browse/J6-22). J6-12 names separate spatial tables, a `surface_type` field, and GiST indexes. This differs from S1's generic feature model; D-12 must reconcile the physical schema before migrations.

## Entities

| Entity | Fields in the source ER diagram |
| --- | --- |
| `role` | `role_id int PK`, `role_name varchar`, `description text` |
| `user` | `user_id int PK`, `name varchar`, `email varchar UNIQUE`, `password_hash varchar`, `role_id int FK`, `created_at timestamp` |
| `recipient` | `recipient_id int PK`, `name varchar`, `email varchar`, `agency varchar` |
| `category` | `category_id int PK`, `pillar varchar`, `name varchar`, `default_recipient_id int FK` |
| `status` | `status_id int PK`, `status_name varchar` |
| `observation` | `observation_id int PK`, `user_id int FK`, `category_id int FK`, `status_id int FK`, `assigned_recipient_id int FK`, `location geometry`, `note text`, `created_at timestamp` |
| `observation_image` | `image_id int PK`, `observation_id int FK`, `image_url varchar`, `exif_lat float`, `exif_lng float`, `captured_at timestamp` |
| `gis_layer` | `layer_id int PK`, `pillar varchar`, `name varchar`, `layer_type varchar`, `is_public boolean` |
| `gis_feature` | `feature_id int PK`, `layer_id int FK`, `geometry geometry`, `properties jsonb` |

## Relationships and meaning

- One role has many users; each user references one role. The source roles are **Visitor**, **Worker**, and **Administrator**.
- A user submits observations. Each observation references a category, current status, and assigned recipient. Whether anonymous reports can omit the user is unresolved (D-01).
- A category references its default recipient; many categories may share a recipient. The observation's assigned recipient records where that report was routed, separately from the category default.
- An observation has attached image records; S1 describes one or more photos. The maximum count and whether a text-only report is allowed are open (D-04).
- Each GIS feature belongs to one layer in S1. Trails, preserve boundaries, and landmarks are feature geometries in that ER diagram; Jira's separate-table design remains to be reconciled in D-12.

The four pillar values are **Human**, **Social**, **Environmental**, and **Economic**, used consistently by layers and categories. The exact catalog and assignment of base layers to pillars are unresolved. Status examples are **Submitted**, **In Review**, and **Resolved**; the complete transition/reopening policy is not specified.

The existing [Figma layer screen](https://www.figma.com/design/zotPKNdYIDv72Bc1mc57CQ/mid-fidelity-prototype?node-id=32-40) uses a “Cultural” history badge; map that label explicitly in D-05 rather than silently extending the four-pillar enum. The [recipient screen](https://www.figma.com/design/zotPKNdYIDv72Bc1mc57CQ/mid-fidelity-prototype?node-id=66-260) already supports multiple email destinations, so D-03 must extend or reconcile the single-recipient model to support the designed flow.

## Spatial and media constraints

- S1 specifies PostGIS geometries using **SRID 4326**. `observation.location` is a point. GIS features may be points, lines, or polygons as appropriate to the dataset.
- Exchange layer data as GeoJSON `FeatureCollection` objects; use longitude then latitude in coordinate arrays. Preserve the source coordinate system during ingestion until data is correctly transformed into the storage SRID.
- Keep flexible non-spatial GIS attributes in `properties`. Trail surface/difficulty, interpretive content, and emergency access information need agreed property schemas before ingestion (D-05).
- `note` is optional. EXIF is supplemental: reports must not depend solely on an image containing GPS/time metadata. Do not invent EXIF values when they are absent.
- Store image bytes in private S3, not the database. S1 calls the persisted reference `image_url`, but access is through expiring presigned URLs. Persist a stable object reference and generate temporary access URLs on demand; the exact column representation is open in D-04.

## Schema details to finish before migrations

The diagram does not define all nullability, lengths, deletion rules, timestamp timezone semantics, or indexes. Proposed constraints are foreign-key integrity, controlled pillar/status values, valid spatial geometries, and spatial indexes for viewport queries. Record the final constraints in migrations and shared contracts.

S3 introduces requirements not fully modeled in S1: duplicate-safe submission identity, durable notification delivery, history/safety content, and report exports. S4 additionally requests report follow-ups and multiple/custom recipients. Do not imply that the nine-table diagram already supports these. D-03, D-05, and D-07 track the needed schema decisions; no additional entity is approved by this document alone.
