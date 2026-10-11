# Expo development environment guide

Prepared for Theo and Team DCC-6342-TSA, October 11, 2026.

**Status: setup in progress.** The root workspace files and tool pins from sections 2–3 now exist. Node 24.21.0 and pnpm 10.26.2 have been verified. Expo scaffolding, dependencies, tests, CI, and EAS remain future instructions; they have not been executed or verified against a generated application.

This covers assignment **3: Prepare Your Development Environment**, focused on your Expo/mobile responsibilities. Backend implementation, database/migration setup, and backend deployment belong to their future owner. Assignment **4: Prepare Your First Implementation Task** will be handled separately; this guide does not select or implement that task.

## 1. Start with the project requirements

Read the [specification index](README.md), [architecture](architecture.md), [security](security.md), [offline GIS requirements](offline-gis.md), and [user flows](design/user-flows.md). Consult the [API](api.md), [data model](data-model.md), and [UI specification](design/ui-spec.md) before work involving those interfaces.

The established mobile stack is React Native, Expo, TypeScript, and MapLibre React Native. iOS is primary; Android is secondary. Use the existing Figma prototype for product screens and Jira for task scope and ownership.

The root workspace and tool pins have been configured through the project owner's setup instructions. GitHub Actions, EAS distribution, and remaining device/account/deployment choices below are **recommendations**, not previously approved project decisions. Record confirmed choices under [D-10](decisions.md). Leave unresolved authentication, API, offline-storage, and privacy mechanisms with their respective decision owners.

## 2. Use the top-level folders you prefer

`apps/` is a convention, not a requirement. Use this proposed layout:

```text
CX_3803_JIDCC_6342_TSA/
├── mobile/                  # Your Expo application
│   ├── package.json
│   ├── app.json             # Or app.config.ts
│   ├── eas.json             # Added during EAS setup
│   ├── src/
│   └── __tests__/
├── backend/                 # Added by the backend owner later
├── packages/                # Add shared packages when needed
│   └── contracts/           # Future agreed types/runtime schemas
├── docs/
├── .github/workflows/
├── .nvmrc
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

Each application has its own dependencies and scripts in its own `package.json`. The root manifest provides repository commands and shared development tools. One root lockfile records the dependency graph for all workspace packages; it does not automatically make backend dependencies available to mobile.

Create the root `pnpm-workspace.yaml`:

```yaml
packages:
  - 'mobile'
  - 'backend'
  - 'packages/*'
```

The backend and shared-package directories do not need to exist yet. Do not create placeholder backend code just to satisfy the layout. See [pnpm workspaces](https://pnpm.io/workspaces) and [Expo monorepos](https://docs.expo.dev/guides/monorepos/).

## 3. Establish reproducible tools

Configured tools: Node.js **24.21.0** in root `.nvmrc` and pnpm **10.26.2** in root `package.json`'s `packageManager`. The manifest permits Node 24.x. Confirm compatibility with the selected Expo SDK during scaffolding.

From the repository root, activate and verify the tools:

```sh
nvm install
nvm use
node --version
pnpm --version
```

Expected versions are `v24.21.0` and `10.26.2`. If pnpm is missing or differs, install the pinned version while Node 24 is active:

```sh
npm install --global pnpm@10.26.2
```

Root `.gitignore` excludes dependencies, local environment files, generated mobile native projects, build/test outputs, and signing credentials. No lockfile exists yet; section 4's root `pnpm install` will generate it.

The original setup sequence, for reference:

1. Install Node using your preferred version manager.
2. Pin the selected Node release in root `.nvmrc` (configured here as `24.21.0`).
3. Install pnpm and check `node --version` and `pnpm --version`.
4. Create root `package.json` with `"private": true` and an exact `packageManager` value (configured here as `"pnpm@10.26.2"`).
5. Commit the manifests, configuration, and generated root lockfile. Ignore dependency folders, build outputs, local environment files, and credentials.

For local iOS compilation, install Xcode, its command-line tools, and an iOS Simulator runtime on your Mac. For Android compilation, install Android Studio, its SDK tools, an emulator, and the JDK required by the generated Android project. Document the actual working versions after the first successful builds.

Local prerequisite check on October 11, 2026: Xcode command-line tools are selected, but `simctl` is unavailable. Android Studio and the Android SDK were not found in their standard locations. Native simulator/emulator tooling still needs setup before local builds; no native tools were installed as part of this step.

## 4. Scaffold Expo into `mobile/`

After creating the root workspace files, run from the repository root:

```sh
pnpm create expo-app@latest mobile --no-install
pnpm install
```

`--no-install` lets you perform the dependency installation from the workspace root. Check the generated app files before proceeding: keep one root lockfile and review any generated pnpm linker configuration. Expo supports pnpm workspaces; use its current SDK guidance rather than copying old custom Metro configurations. If a native dependency cannot resolve with isolated installs, consult Expo's documented hoisted-install fallback.

Keep the generated TypeScript configuration and Expo Router structure initially. Test files should live outside the router's route directory. Preserve the repository's existing `AGENTS.md` and review any generated app instructions for consistency.

Once generated, inspect `mobile/package.json` to confirm the scripts and versions. Prefer Expo's installer for Expo/React Native dependencies so it can select compatible versions:

```sh
pnpm --dir mobile exec expo install expo-dev-client
pnpm --dir mobile exec expo install --check
pnpm --dir mobile dlx expo-doctor
```

Do not install camera, location, queue-storage, or authentication libraries simply to complete the scaffold. Add them when their approved work requires them.

## 5. Plan for development builds and MapLibre

MapLibre includes native code and **cannot run in Expo Go**. Your ongoing development workflow should use an Expo development build. A starter app opening in Expo Go alone does not demonstrate that the selected native stack works. See [MapLibre's Expo setup](https://maplibre.org/maplibre-react-native/docs/setup/expo/).

If validating MapLibre compatibility is included in the team's environment-setup scope, install it:

```sh
pnpm --dir mobile exec expo install @maplibre/maplibre-react-native
```

Add `@maplibre/maplibre-react-native` to the existing `expo.plugins` array in the app configuration, preserving other plugins. Check its React Native and architecture requirements against the selected Expo SDK. Rebuild after adding native dependencies or changing native configuration.

From the repository root, local development commands are:

```sh
# Compile and launch the development app on an iOS Simulator.
pnpm --dir mobile exec expo run:ios

# Compile and launch it on an Android emulator.
pnpm --dir mobile exec expo run:android

# Start Metro for an already installed development build.
pnpm --dir mobile exec expo start --dev-client
```

For the initial setup, keep native projects generated through Expo's Continuous Native Generation workflow unless the team chooses to maintain native source directly. Document that choice and ignore generated `ios/` and `android/` directories if using generation. Avoid manual native edits that would disappear during regeneration.

A temporary compatibility check can use synthetic data. Implementing the preserve map, real datasets, GPS behavior, or Figma screens belongs to later product tasks.

## 6. Separate configuration from secrets

When an API URL becomes necessary, commit `mobile/.env.example` with a clearly labeled placeholder:

```dotenv
EXPO_PUBLIC_API_URL=https://replace-with-approved-api-host.example
```

Developers copy this to an ignored `mobile/.env.local` and supply their environment's URL. The placeholder is not a running service. The scaffold and unit tests should work without a live backend, using explicit test fixtures where necessary.

Expo embeds `EXPO_PUBLIC_*` values in the client bundle. They are public configuration, not secret storage. Never include database credentials, AWS keys, SMTP credentials, guest ownership credentials, or the CI Expo token in the app configuration. See [Expo environment variables](https://docs.expo.dev/guides/environment-variables/).

Keep sensitive reports and GPS coordinates out of debug output and test artifacts. Use synthetic coordinates, images, and recipient addresses in fixtures. Coordinate eventual API contracts with the backend owner; the example endpoints in the [API specification](api.md) are proposed, not implemented.

## 7. Add linting, formatting, and type checking

Use Expo's ESLint configuration in `mobile/` and Prettier at the workspace root:

```sh
pnpm --dir mobile exec expo lint
pnpm add -Dw prettier
```

The first lint command can initialize missing ESLint configuration. Retain the generated Expo TypeScript configuration and enable strict checking. See [Expo linting and formatting](https://docs.expo.dev/guides/using-eslint/).

Merge these scripts into `mobile/package.json`, preserving useful generated scripts:

```json
{
  "scripts": {
    "start": "expo start --dev-client",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "lint": "eslint . --max-warnings=0",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:ci": "jest --ci --runInBand --coverage",
    "bundle:check": "expo export --platform ios --output-dir dist/ios && expo export --platform android --output-dir dist/android"
  }
}
```

Add root scripts to give contributors one documented entry point:

```json
{
  "scripts": {
    "mobile": "pnpm --dir mobile start",
    "lint": "pnpm --dir mobile lint",
    "typecheck": "pnpm --dir mobile typecheck",
    "test": "pnpm --dir mobile test",
    "test:ci": "pnpm --dir mobile test:ci",
    "bundle:check": "pnpm --dir mobile bundle:check",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

These root checks initially cover mobile. The backend owner should expand them when backend tooling exists. Add a root `.prettierignore` for dependency folders, coverage, `dist`, generated native directories, and generated lockfiles. Establish formatting once before making `format:check` required; avoid mixing a repository-wide formatting rewrite with product changes.

`bundle:check` checks JavaScript bundling for both platforms. It does not compile native code or demonstrate that maps and device APIs work.

## 8. Set up useful mobile tests

Install Jest, Expo's Jest preset, and React Native Testing Library inside mobile:

```sh
pnpm --dir mobile exec expo install jest-expo jest @types/jest @testing-library/react-native --dev
```

Add a minimal `mobile/jest.config.cjs`:

```js
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  coverageDirectory: 'coverage',
};
```

Start with a test that renders an existing scaffold component and exercises an actual interaction or observable state. Match the installed Testing Library API and any peer requirements. Add pnpm-aware transforms or native mocks only when dependencies require them. Do not use `--passWithNoTests` to make an empty test suite look complete. See [Expo's Jest guide](https://docs.expo.dev/develop/unit-testing/).

For later feature work, use the project's acceptance paths to guide regression tests:

| Future behavior | What a regression test should establish |
| --- | --- |
| Location permission denial | Map browsing remains available; no fabricated location |
| Report network failure | User-entered content remains available |
| Offline restart | A submitted pending report and photo references survive restart |
| Interrupted upload/retry | Stable submission identity and no duplicate accepted report |
| Guest reporting | Capture, submission, and sync do not require login |
| Custom recipients | Drafts/retries preserve custom mode without fallback park routing |

These are future test targets, not features to implement during environment setup. Server authorization and true duplicate prevention also require backend tests and integration checks; mobile mocks cannot prove them.

Mock camera, location, connectivity, storage, and native map interfaces for deterministic unit/component tests. Separately verify native behavior on iOS and supported Android devices. Add Maestro end-to-end tests once meaningful user journeys exist; full offline-restart and backend access tests need an integrated environment.

## 9. Add GitHub Actions for pull-request verification

Recommendation: GitHub Actions runs inexpensive checks on every pull request and push to `main`. EAS handles native compilation and distribution separately.

After all scripts above work locally, create root `.github/workflows/ci.yml`:

```yaml
name: Mobile CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: mobile-ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test:ci
      - run: pnpm bundle:check
```

`pnpm/action-setup` reads the exact pnpm version from root `packageManager`, currently `pnpm@10.26.2`. Review action versions when implementing and pin to verified commit SHAs if that is the team's policy.

Use a committed lockfile and frozen installation so CI fails when manifests and lockfile disagree. Keep this workflow independent of backend availability and Expo credentials. Once proven, make `verify` a required status check for the protected `main` branch.

## 10. Configure native builds and team delivery with EAS

Agree on an Expo organization/project owner, application identifiers, signing ownership, build budget, and distribution method under D-10. iOS Simulator builds and physical-device builds have different signing/distribution requirements; document both. Keep the project accessible to the team rather than relying on one person's account.

Install EAS CLI as a mobile development dependency so the lockfile records its version:

```sh
pnpm --dir mobile add -D eas-cli
pnpm --dir mobile exec eas login
pnpm --dir mobile exec eas init
pnpm --dir mobile exec eas build:configure
```

Run EAS commands from `mobile/`, and keep `eas.json` there. See [EAS monorepo setup](https://docs.expo.dev/build-reference/build-with-monorepos/).

Merge appropriate profiles into the generated `mobile/eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

Here `development` produces an iOS Simulator development client or an Android development build. `preview` produces an internally distributed device build for team review. `production` is reserved for a later release process. Add a separate physical-iOS development-client profile if the team needs one.

First complete interactive builds from your machine to resolve project configuration and signing:

```sh
pnpm --dir mobile exec eas build --platform ios --profile development
pnpm --dir mobile exec eas build --platform android --profile development
```

Install and launch the resulting apps. A successful cloud compilation alone is not a device smoke test.

Then add a manual GitHub Actions build workflow. Store an appropriately scoped Expo access token in GitHub Actions secrets as `EXPO_TOKEN`; never commit it. The build workflow should check out code, install the pinned tools and frozen dependencies, run the same verification commands as CI, and then run:

```sh
pnpm --dir mobile exec eas build --platform all --profile development --non-interactive
```

Supply `EXPO_TOKEN` only to the trusted build step. Use `workflow_dispatch` initially; after checks and preview distribution are proven, the team can choose automatic preview delivery from `main`. Do not run secret-bearing builds against untrusted pull-request code.

Wait for EAS completion when reporting build success. `--no-wait` only confirms that a build was queued. Expo documents the prerequisite interactive setup and CI authentication in [building on CI](https://docs.expo.dev/build/building-on-ci/).

For this milestone, CD means delivering installable builds to the team. Store submission and over-the-air updates are later release choices. Before enabling EAS Update, define channels/environments, runtime compatibility, and rollback procedures; native dependency changes still require compatible native builds.

## 11. Document and demonstrate the finished environment

Once setup is actually implemented, update the root README or a linked development document with:

- Required tools and exact working versions.
- Fresh-clone installation using `pnpm install --frozen-lockfile`.
- Startup commands for Metro, iOS, and Android.
- Environment-file instructions and how to work without the backend.
- Lint, formatting, type-check, test, and bundle commands.
- Native build/distribution instructions and team ownership.
- Which checks use mocks, which require a device, and which require the backend.

Before considering your portion of assignment 3 complete, demonstrate:

- [ ] A teammate can follow the instructions from a fresh clone.
- [ ] Mobile dependency installation uses the root workspace and lockfile.
- [ ] The development app launches on iOS and the agreed Android target.
- [ ] Jest executes at least one real test, and a deliberate failing assertion fails CI.
- [ ] Linting, formatting, type checking, and both platform bundle checks pass.
- [ ] Pull requests show the required CI check.
- [ ] At least one iOS native build succeeds and is launched on its intended target.
- [ ] Android build/launch evidence is recorded for the supported target.
- [ ] EAS team delivery is demonstrated, or its remaining account/signing dependency is explicitly recorded.
- [ ] No secrets or real report/location data appear in source, bundles, logs, or artifacts.
- [ ] `git diff --check` passes and documentation links are valid.

Your mobile setup can be complete while backend environment work remains assigned to someone else. The project's overall database, migration, and backend-test requirements still need that owner's work before the whole team claims its environment is ready.

Assignment 4 remains a separate team activity: its owner will select the first task, define scope and acceptance criteria, and request an investigation and plan that stops before implementation.
