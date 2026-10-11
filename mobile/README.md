# Cascade Springs mobile

Expo SDK 57 / React Native 0.86 / TypeScript starter application. Product screens are not implemented yet; follow the team's Figma prototype and [project specifications](../docs/README.md) when feature work begins.

Use the shared pnpm workspace and root lockfile. From the repository root:

```sh
nvm use
pnpm install --frozen-lockfile
pnpm mobile
```

Metro serves an already installed development client. MapLibre requires a development build and cannot run in Expo Go. For local compilation, use `pnpm ios` or `pnpm android` after installing the required native tools. SDK 57 requires Xcode 26.4 or newer; the currently installed Xcode 16.4 is insufficient.

```sh
pnpm lint
pnpm typecheck
pnpm test:ci
pnpm bundle:check
```

Jest tests starter interactions and theme selection with native mocks. Bundle checks export iOS and Android JavaScript; they do not compile or launch a native app. No backend or local `.env` is required for these checks.

Routes live in `src/app/`; components and hooks live outside that directory. `ios/` and `android/` are generated and ignored. Change native configuration through Expo config/plugins, then rebuild.

See the [development setup guide](../docs/old-plans/expo-setup.md) for testing, CI, and EAS delivery instructions.
