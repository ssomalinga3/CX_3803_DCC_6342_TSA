This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
pnpm exec expo install <package>  # SDK-compatible versions; run inside mobile/
pnpm start                       # development-client dev server
pnpm lint                        # lint
pnpm typecheck                   # typecheck
pnpm dlx expo-doctor             # diagnose dependency and config issues
pnpm exec expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Run the lockfile-pinned CLI with `pnpm exec eas <command>` inside mobile/. EAS cloud compilation does not require local Xcode or Android Studio, but local native builds and simulator/emulator checks do. Project ownership, signing, and distribution must be configured before cloud builds. Store submission and over-the-air updates are outside the initial environment setup.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Testing

Use the installed React Native Testing Library docs in `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md` before changing tests. Its v14 render and interaction functions are asynchronous. Keep tests outside `src/app/` and native mocks in the Jest setup. Test renderer 1.2.0 is pinned for the scaffold's React 19.2; upgrade these together.
