# Cascade Springs mobile

Expo SDK 57 / React Native 0.86 / TypeScript starter application. Product screens are not implemented yet; follow the team's Figma prototype and [project specifications](../docs/README.md) when feature work begins.

## First-time iOS Simulator setup

Use EAS cloud compilation and a local iOS Simulator. Local JavaScript development uses Metro; a macOS upgrade is not part of this workflow. MapLibre requires a development client and cannot run in Expo Go.

Install Xcode and an iOS Simulator runtime supported by your installed Xcode. Open Xcode once to complete its setup and accept its license. In Xcode Settings → Locations, select the installed Xcode under Command Line Tools. If you prefer a shell-only selection instead of changing the system setting:

```sh
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
xcrun simctl list devices available
```

Keep that environment variable in terminals used for simulator commands and Metro. This selects existing Xcode tools; it does not upgrade Xcode. If no devices are available, install a compatible iOS runtime through Xcode Settings and create an iPhone simulator. Cloud compilation and local runtime compatibility must be verified separately.

Use the shared pnpm workspace and root lockfile. Run all commands below from the repository root:

```sh
nvm use
pnpm install --frozen-lockfile
pnpm --dir mobile exec eas login
pnpm --dir mobile exec eas whoami
pnpm ios:build
```

Your Expo account needs access to the `cx3803jidcc6342tsa` organization. The app is already linked to `@cx3803jidcc6342tsa/cascade-springs`; do not create another EAS project or change its application identifiers. The existing `development` profile builds an iOS Simulator development client, without physical-device signing or an Apple Developer Program membership. EAS cloud usage is subject to the organization's plan and available build quota. Never commit access tokens or credentials.

Wait for EAS to report a successful build, then install it:

```sh
pnpm ios:install
pnpm mobile
```

The install command selects the latest build from the iOS `development` profile and prompts for a simulator. To install a specific completed build, use its build ID instead:

```sh
pnpm --dir mobile exec eas build:run --platform ios --id <build-id>
```

With Metro running, press `i` to open the installed development client, or `Shift+i` to choose a simulator. Verify that the starter home screen loads, switch to Explore and back, reload from Metro with `r`, and close/reopen the app while Metro remains running. No backend or local `.env` is required for the starter.

## Daily development

```sh
nvm use
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
pnpm mobile
```

Press `i` to open the app. JavaScript and TypeScript edits use Fast Refresh; restarting Metro does not require another cloud build. Run `pnpm ios:build` and `pnpm ios:install` again after adding/updating native dependencies or changing native app configuration/plugins. Ensure the installed build matches your checkout's native dependencies.

`pnpm ios` compiles locally and is reserved for a compatible local toolchain. Expo SDK 57 requires Xcode 26.4 or newer for compilation; older Xcode can still provide the local simulator if the cloud-built app supports its runtime. Revisit host upgrades if cloud native rebuilds become a workflow bottleneck. Android native setup remains separate.

## Parallel work with another branch

Keep each agent in its own persistent worktree. From the original checkout, create a sibling worktree for an existing, unoccupied mobile branch:

```sh
git worktree add ../CX_3803_JIDCC_6342_TSA-ios setup/eas-ios-simulator
cd ../CX_3803_JIDCC_6342_TSA-ios
nvm use
pnpm install --frozen-lockfile
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
pnpm mobile --port 8082
```

If this worktree already exists, enter it instead of adding it again. Keep branch switches, installs, edits, and commits inside the relevant worktree. Worktrees share Git history but have separate files and dependencies. Servers and simulator devices are shared across the laptop: use distinct ports and connect the development client to the mobile worktree's Metro server. The starter has no backend dependency, so its smoke check does not validate a concurrent backend PR.

## Verified simulator baseline

On November 1, 2026, [EAS development build 4470b233](https://expo.dev/accounts/cx3803jidcc6342tsa/projects/cascade-springs/builds/4470b233-efec-4569-87f1-37672d1a5adc) compiled successfully, installed, and ran on an iPhone 16 simulator with iOS 18.6, using macOS 15.7.9 and Xcode 16.4. Metro served the starter from the separate mobile worktree on port 8082. Home rendering, Explore navigation through `cascade-springs://explore`, its File-based routing disclosure, Metro reload, and app close/reopen were verified. Automated tab-bar tapping was not verified because the UI automation tool could not send coordinate clicks; test the tabs manually using the steps above. See the [home-screen capture](../docs/images/ios-simulator-starter.png).

The cloud build used the existing starter native dependencies; this PR adds workflow commands and documentation. This establishes simulator compatibility for that build, not physical-device, GIS map, offline, or backend acceptance. `pnpm verify` passed separately from native compilation and simulator verification.

## Troubleshooting

- **`simctl` unavailable:** select full Xcode tools or set `DEVELOPER_DIR` as above; standalone Command Line Tools do not contain the simulator.
- **No development build installed:** wait for the cloud build to finish and run `pnpm ios:install`. `pnpm mobile` only starts Metro.
- **Wrong/stale build:** install by the exact EAS build ID. Rebuild after native dependency/configuration changes.
- **Cannot connect to Metro:** keep Metro running in this checkout; use the server address it prints in the development client. Restart with `pnpm mobile --clear` if its cache is stale.
- **EAS login/project access failure:** check `eas whoami` using the command above and ask an organization owner to grant access. Do not relink the project.
- **Install/launch fails on an older runtime:** retain the build URL and simulator error. A successful cloud build alone does not establish local compatibility; report the blocker before changing Expo or upgrading macOS.

## Checks and project structure

```sh
pnpm verify
```

This runs formatting, lint, type checks, Jest, and iOS/Android JavaScript bundle exports across the configured workspace. Jest tests starter interactions and theme selection with native mocks. Bundle checks do not compile or launch a native app; record EAS compilation and simulator smoke results separately.

Routes live in `src/app/`; components and hooks live outside that directory. `ios/` and `android/` are generated and ignored. Change native configuration through Expo config/plugins, then rebuild.

See [Expo's simulator build workflow](https://docs.expo.dev/build-reference/simulators/) and the historical [development setup guide](../docs/old-plans/expo-setup.md). Use this README for the current local iOS workflow.
