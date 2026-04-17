# Tauri Codex Usage Current Architecture

## Summary

The repository is no longer in the pre-migration state. The active implementation is a `Tauri 2 + Vue 3 + Vite` application whose verified runtime in this workspace is `Windows desktop`.

The app does one thing: persist a Codex API key locally, query `https://code.ylsagi.com/codex/info`, and render subscription and usage data with manual refresh plus interval polling.

## Implemented Architecture

The current dependency direction is:

`Vue UI -> codex-usage service -> platform contracts -> tauri/web adapters`

Implemented layers:

- `src/App.vue` and `src/components/*`
  - presentation and user interaction
- `src/features/codex-usage/*`
  - hydration
  - save/reset
  - refresh
  - polling
  - stale-request protection
- `src/platform/*`
  - storage contract
  - usage API contract
  - runtime contract
  - Tauri and web implementations
- `src-tauri/*`
  - native bootstrap
  - capabilities
  - store/http/stronghold plugin registration

## Persistence Design

Persistence is intentionally split by responsibility:

- Non-secret settings:
  - file: `settings.json`
  - data: currently `pollInterval`
  - mechanism: `@tauri-apps/plugin-store`
- Secret data:
  - file: `vault.hold`
  - secret entry key: `api-key`
  - client name: `codex-usage`
  - mechanism: `@tauri-apps/plugin-stronghold`

Observed Windows persistence directory:

- `%APPDATA%\com.ylsagi.codexusage\settings.json`
- `%APPDATA%\com.ylsagi.codexusage\vault.hold`

This means the Tauri desktop path no longer stores the API key in renderer `localStorage`.

## Save And Refresh Flow

### Hydrate

1. Load `pollInterval` from `settings.json`
2. Load the secret from Stronghold
3. Copy both into the Vue-owned reactive state
4. If a key exists, refresh immediately and start polling

### Save Profile

1. Trim the input key
2. Apply the new key to in-memory state immediately
3. Persist `pollInterval`
4. Restart polling
5. Refresh usage immediately with the new key
6. If the key changed, persist the secret to Stronghold in the background

### Refresh Usage

1. Read the current in-memory key
2. Send a request to `https://code.ylsagi.com/codex/info`
3. If the backend returns a non-200 body with `msg`, surface that message
4. Only the latest refresh request may write back `data`, `error`, and `loading`

## Windows Runtime Findings

- Cold Stronghold operations can be slow on Windows
- The app now mitigates that with:
  - Stronghold prewarm on startup
  - cached Stronghold client reuse
  - same-key save skip
  - background persistence for changed keys
- The main network request is not the dominant latency source in the slow-save scenario

## Verified Scope

Verified in this workspace:

- `pnpm test`
- `pnpm build`
- `cargo check --manifest-path src-tauri/Cargo.toml`
- Windows Tauri smoke testing

Not verified in this workspace:

- Linux runtime/package verification
- iOS init/dev on macOS

## Design Rules Going Forward

- Keep Tauri APIs inside `src/platform/tauri/*` and `src-tauri/*`
- Keep secret and non-secret persistence split
- Do not reintroduce `localStorage` for the API key in the desktop path
- Treat Windows Stronghold latency as a real runtime constraint when designing future UX
