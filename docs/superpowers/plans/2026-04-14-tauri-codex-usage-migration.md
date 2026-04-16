# Tauri Codex Usage Delivery Status And Remaining Work

## Status

The migration plan in this file has already been executed for the current Windows desktop path. What remains now is maintenance and cross-platform verification, not first-time scaffolding.

## Completed

- Removed the old `uTools` runtime path from the live app flow
- Extracted feature logic into `src/features/codex-usage`
- Added `src/platform` contracts and both `web`/`tauri` adapters
- Added the Tauri shell, capabilities, and Rust bootstrap
- Split persistence between Store and Stronghold
- Added automated tests for feature and platform helpers
- Verified `pnpm test`, `pnpm build`, and `cargo check --manifest-path src-tauri/Cargo.toml`
- Performed Windows desktop smoke testing with Tauri dev runtime
- Fixed the stale-request overwrite problem that could show valid data plus an old invalid-key error at the same time
- Shortened the perceived save path by applying new keys immediately and moving Stronghold persistence off the click-critical path

## Current Runtime Rules

- `pollInterval` belongs in `settings.json`
- `API key` belongs in Stronghold `vault.hold`
- Same-key saves must not write Stronghold again
- Backend error `msg` should be preserved when present
- Only the latest refresh request may update visible query state

## Remaining Work

1. Verify Linux desktop runtime before claiming Linux support
2. Validate the macOS GitHub Actions release build before documenting macOS release automation as verified
3. Decide whether the UI copy around local encryption should be softened to avoid overclaiming security guarantees
4. Add packaging/install verification for Windows release builds

## Maintenance Checklist After Future Runtime Changes

1. Re-run `pnpm test`
2. Re-run `pnpm build`
3. Re-run `cargo check --manifest-path src-tauri/Cargo.toml`
4. If storage behavior changed, inspect `%APPDATA%\com.ylsagi.codexusage\settings.json` and `vault.hold`
5. Update `README.md`, `AGENTS.md`, and `docs/context/resume.md` in the same change
