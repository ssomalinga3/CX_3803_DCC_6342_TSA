# Workspace commands

The repository is a pnpm workspace. The root `package.json` exposes one set of entry-point scripts; the concrete command for each check lives in the package that runs it, and the root forwards to it.

## How the root scripts resolve

Two mechanisms are in use:

- **Per-package delegation.** Check scripts (`lint`, `typecheck`, `test`, `test:ci`, `bundle:check`) call into a specific package, currently with `pnpm --dir mobile <script>`. The real definition lives in that package's `package.json`.
- **Repository-wide.** Formatting (`format`, `format:check`) runs Prettier over the whole tree from the root, independent of any package. This is why formatting covers files outside the application packages, such as `docs/`.

Listing a directory in `pnpm-workspace.yaml` makes it a workspace member but does not make the root scripts run there; that depends on how each root script is written.

## Contract for a package

A workspace package participates in the shared commands by defining scripts under the names the root aggregates — `lint`, `typecheck`, and `test`/`test:ci`. Keeping these names consistent across packages lets the root run one script name everywhere. Concerns specific to a package (for example, database setup, migrations, and server environment variables) stay in that package rather than the root.

To aggregate a script across every package that defines it, use `pnpm -r <script>`. Packages that omit a script are skipped, so recursive scripts remain valid as packages are added.

## Related

CI runs these root scripts on pull requests and pushes to `main`; see [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). Hosting, runtime versions, and deployment ownership remain open in [D-10](decisions.md).
