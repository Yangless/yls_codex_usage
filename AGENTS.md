# yls_codex_usage

## Project

- Repository technical name: `yls_codex_usage`
- App display name: `Codex 用量查询`
- Stack: `Vue 3 + Vite 6 + Vitest + Tauri 2`
- Current verified targets in this workspace:
  - `Windows desktop`
  - `Linux desktop` on local `Ubuntu 24.04.3 LTS`, including manual business smoke
- Not yet fully verified in this workspace:
  - `macOS desktop` release build is automated through GitHub Actions and should only be claimed verified after the workflow succeeds

## Resume First

When resuming work in Codex, read these files first:

1. `docs/context/resume.md`
2. `README.md`
3. `docs/superpowers/specs/2026-04-14-tauri-codex-usage-migration-design.md`
4. `docs/superpowers/plans/2026-04-14-tauri-codex-usage-migration.md`

## Current State

- The old `uTools` runtime has been removed from the active app path
- `src/platform` is the only boundary between feature logic and host APIs
- `src/platform/tauri/storage.tauri.ts` splits persistence by responsibility:
  - `pollInterval` is stored in Tauri Store `settings.json`
  - `API key` is stored in Tauri Stronghold `vault.hold`
- Windows observed persistence directory: `%APPDATA%\com.ylsagi.codexusage\`
- Usage requests go directly to `https://code.ylsagi.com/codex/info`
- Backend error bodies are surfaced through `msg` when present
- Refresh requests are guarded so only the latest request may update `state.data`, `state.error`, and `state.loading`
- New keys are applied in memory immediately and persisted to Stronghold in the background
- Same-key saves skip Stronghold writes
- Stronghold is prewarmed and cached because cold `load/save` operations on Windows can be slow

## Verified In This Workspace

- `pnpm test`
- `pnpm build`
- `cargo check --manifest-path src-tauri/Cargo.toml`
- `pnpm tauri dev` on Windows with manual save/refresh smoke testing
- `pnpm test` inside local `Ubuntu 24.04.3 LTS`
- `pnpm build` inside local `Ubuntu 24.04.3 LTS`
- `cargo check --manifest-path src-tauri/Cargo.toml` inside local `Ubuntu 24.04.3 LTS`
- `pnpm tauri build` inside local `Ubuntu 24.04.3 LTS`
- `pnpm tauri dev` inside local `Ubuntu 24.04.3 LTS`, with `vite`, `cargo run`, and `./yls_codex_usage` process launch observed
- direct launch of `src-tauri/target/release/yls_codex_usage` inside local `Ubuntu 24.04.3 LTS`
- Linux manual smoke inside local `Ubuntu 24.04.3 LTS`:
  - invalid key save and backend error message observed directly
  - valid key save / refresh / restart-readback marked passed by user confirmation

## Important Paths

- `src/features/codex-usage`: feature logic, state transitions, polling, tests
- `src/platform`: runtime, storage, and HTTP contracts/adapters
- `src-tauri`: Rust host, capabilities, native shell config
- `docs/context/resume.md`: latest session snapshot
- `%APPDATA%\com.ylsagi.codexusage\settings.json`: saved poll interval
- `%APPDATA%\com.ylsagi.codexusage\vault.hold`: encrypted API key vault

## Commands

```bash
pnpm install
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
pnpm tauri dev
pnpm tauri build
```

## Known Constraints

- Do not claim Linux or macOS validation unless those targets were actually run
- Do not claim the API key is in `localStorage`; that is no longer true in the Tauri path
- Stronghold may create companion files such as `vault.hold.*` in the app data directory
- Cold Stronghold operations on Windows can still take noticeable time even after the current mitigations
- Linux runtime may emit `libEGL/MESA` warnings; record them as observed behavior unless a concrete rendering or launch failure is reproduced
