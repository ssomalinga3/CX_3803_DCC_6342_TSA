# Security and privacy

Baseline: S1 pp. 9 and 12; S3 stories 1, 6, 7, and 10. This records project requirements; it does not certify an implemented system.

[J6-15](https://gatech-team-f1s41wh9.atlassian.net/browse/J6-15) tracks location permissions, denial fallback, and exclusion of locations from server logs. Follow Figma's existing [location-share confirmation](https://www.figma.com/design/zotPKNdYIDv72Bc1mc57CQ/mid-fidelity-prototype?node-id=66-277): preview the location and named recipients, state that nothing has been sent, and require the explicit confirm action. Prototype recipient names are not authorization to configure those destinations in production.

## Access boundaries

| Resource/action | Baseline access |
| --- | --- |
| Public GIS layers | Read-only public API with caching headers |
| Non-public GIS layers | Not included in public responses; exact authorized roles open |
| Submit an observation | Validate all input; whether visitor login is mandatory is open |
| Staff report views, routing, status changes, exports | Authentication and role-based authorization for authorized Conservancy staff |
| Report photos | Private S3 objects; time-limited presigned access after authorization |
| Share a visitor's location | Only on the visitor's explicit action |

The model has Visitor, Worker, and Administrator roles. S1 does not provide a complete role/action matrix; being a researcher or holding the Worker role must not implicitly grant every administrative privilege. Apply checks in the API, including individual records and media, rather than relying on hidden UI controls. Public visibility of submitted reports remains unresolved (D-02).

## Location and images

- Request explicit device location permission before capturing GPS. The map remains interactive if permission is denied. Camera permission is needed for photo capture.
- Do not write user GPS coordinates to server logs. Proposed implementation checks include request-body redaction and excluding sensitive values from error/analytics payloads.
- Read needed EXIF GPS/time on submission, then strip unnecessary sensitive image metadata before storage. EXIF coordinates are optional evidence, not a replacement for report location.
- Restrict uploads to JPEG/PNG and enforce a configured maximum size. Exact image count, byte/dimension limits, and handling of unsupported phone formats are open in D-04.
- Do not make the S3 bucket public or persist expiring presigned URLs as durable image identifiers.
- Offline reports include photos and precise locations on the device. Their storage protection, retention, deletion, and sign-out behavior need an explicit policy (D-09).

## Transport, credentials, and untrusted input

All mobile/API exchange uses HTTPS/TLS. SES notifications use authenticated SMTP; encryption settings must be included in deployment configuration. Keep database, AWS, and SMTP credentials out of source control and mobile bundles; supply them through environment variables or managed secrets.

Validate and sanitize text, coordinates, category references, and uploaded files on the server. Proposed implementation safeguards: parameterized SQL, server-derived identity/status, content-based image validation rather than trusting extensions, and safe encoding when displaying report notes or generating email. Automated report moderation is out of scope, but these validation requirements are not moderation.

## Required verification

Check that unauthorized requests cannot view staff reports, alter statuses, export records, or obtain private media access; public layer requests cannot expose restricted features; invalid/oversized uploads are rejected; denied device permissions have usable fallbacks; location is absent from logs; and expired media links stop working. Authentication/session implementation, password policy, abuse limits, retention, and complete staff permissions are unresolved in D-01, D-02, D-04, and D-09.
