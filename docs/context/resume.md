# Resume Context

## Canonical Naming

- Repository/package name: `yls_codex_usage`
- App display name: `Codex 用量查询`
- Bundle identifier: `com.ylsagi.codexusage`

## What This Repo Is

This repository contains the live Tauri 2 version of the Codex usage dashboard. The current product scope is still intentionally narrow: save a key, query Codex usage/subscription data, display daily/weekly usage, and poll on an interval.

## Current Architecture

- Vue UI lives in `src/App.vue` and `src/components`
- Feature logic lives in `src/features/codex-usage`
- Platform contracts/adapters live in `src/platform`
- Native shell/config lives in `src-tauri`
- The Tauri path is the active app path
- The web adapters remain only as fallback/test helpers

## Key Storage Audit

- `pollInterval` is stored in Tauri Store `settings.json`
- `API key` is stored in Tauri Stronghold `vault.hold`
- Storage implementation file: `src/platform/tauri/storage.tauri.ts`
- Stronghold client name: `codex-usage`
- Stronghold secret key: `api-key`
- Observed Windows persistence directory: `%APPDATA%\com.ylsagi.codexusage\`
- Observed Windows files:
  - `%APPDATA%\com.ylsagi.codexusage\settings.json`
  - `%APPDATA%\com.ylsagi.codexusage\vault.hold`
- `settings.json` currently contains only the non-secret poll interval

## Recent Runtime Findings

- A previous “button click has no response” symptom included a Vue reactivity issue; that path has been fixed
- Windows Stronghold cold `load/save` can be very slow
- Current mitigations:
  - prewarm Stronghold during adapter creation
  - cache the loaded Stronghold client
  - skip Stronghold save when the key is unchanged
  - apply a new key immediately in memory and persist it in the background
  - ignore stale refresh responses so old-key errors do not overwrite newer success states
- Backend `401` responses now surface the backend `msg`, for example `无效的 API 密钥, 请检查配置参考: https://docs.ylsagi.io/codex/install`

## Verified In This Workspace

- `pnpm test`
- `pnpm build`
- `cargo check --manifest-path src-tauri/Cargo.toml`
- `pnpm tauri dev` on Windows
- Manual Windows smoke coverage:
  - save valid key
  - save invalid key
  - restart and reload stored config
  - observe save/refresh behavior around Stronghold latency

## Not Yet Verified Here

- Linux desktop smoke
- Linux packaging
- iOS init/dev on macOS

## Next Recommended Steps

1. Keep Windows as the only claimed verified target until Linux/iOS are actually run
2. If Stronghold latency remains user-visible on more machines, consider a clearer foreground/background save state split in the UI copy
3. Add packaging/installer verification once the desktop flow is considered stable
4. Only document iOS again after `src-tauri/gen/apple` exists and a real init/dev pass has been completed

## Resume Rule

If a new Codex session starts from scratch, begin by reading:

1. `AGENTS.md`
2. `docs/context/resume.md`
3. `README.md`

Then check:

```bash
git status --short
pnpm test
pnpm build
```
