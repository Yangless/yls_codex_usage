# Release Asset Renaming Design

## Summary

This design standardizes the public `GitHub Release` asset filenames for `yls_codex_usage` while preserving the current in-app display name and bundle-facing product naming.

The repository currently builds valid desktop packages, but the uploaded asset names inherit the Chinese `productName` from `src-tauri/tauri.conf.json`, which leads to awkward filenames in the public release page. This design keeps the application title as `Codex 用量查询` and only normalizes the downloadable asset filenames to stable ASCII names in the release workflow.

## Goals

- Keep the app window title and installed app display name unchanged
- Keep `src-tauri/tauri.conf.json` `productName` unchanged
- Publish public release assets with stable ASCII filenames
- Use one naming convention across `Windows`, `Linux`, and `macOS`
- Avoid touching frontend or backend business logic

## Non-Goals

- Renaming the app inside the packaged installers
- Changing the Tauri bundle identifier
- Changing API endpoints, request behavior, or storage behavior
- Introducing signing, notarization, or updater behavior
- Reworking the release process beyond what is needed for asset renaming

## Current Repository Context

Current relevant state in the repository:

- `src-tauri/tauri.conf.json` uses `productName` `Codex 用量查询`
- the current release workflow successfully builds and uploads multi-platform desktop artifacts
- current public filenames on GitHub Releases are generated from Tauri bundle output naming
- those filenames are valid artifacts, but they are not ideal for a public download experience because they contain sanitized remnants of the Chinese product name

## Recommended Approach

Use a **workflow-only asset renaming layer** in `.github/workflows/release.yml`.

The release workflow should continue to build native Tauri artifacts on each runner, but it should stop relying on default uploaded filenames as the final public names. Instead, each runner should:

1. build the platform artifacts
2. collect the generated output files from Tauri bundle directories
3. rename copies of those files to a repository-controlled ASCII naming scheme
4. upload the renamed files to the GitHub Release

This keeps runtime metadata intact while making the public release page cleaner and more predictable.

## Alternatives Considered

### Option A: Rename release assets in GitHub Actions
**Recommended**

Pros:
- preserves the current app display name
- preserves the current installed app naming behavior
- affects only public release filenames
- keeps the change isolated to workflow code

Cons:
- requires explicit artifact collection and upload logic in the workflow
- no longer relies entirely on the default Tauri upload naming

### Option B: Change `productName` to ASCII

Pros:
- simplest implementation
- default Tauri artifact names become cleaner automatically

Cons:
- changes the packaged app name, not just the download filenames
- risks changing what users see in the app shell and installer

### Option C: Add a release-only Tauri config override

Pros:
- keeps development config untouched
- can isolate release-specific metadata

Cons:
- still changes packaged app naming during release builds
- does not satisfy the requirement to only clean up download filenames

## Naming Design

The release asset naming authority should come from the repository technical name plus the tag version without the leading `v`.

Base naming pattern:

`yls_codex_usage_<version>_<platform>_<arch>_<kind>.<ext>`

Examples for `v0.1.0`:

- `yls_codex_usage_0.1.0_windows_x64_setup.exe`
- `yls_codex_usage_0.1.0_linux_x64_appimage.AppImage`
- `yls_codex_usage_0.1.0_linux_x64.deb`
- `yls_codex_usage_0.1.0_linux_x64.rpm`
- `yls_codex_usage_0.1.0_macos_x64.dmg`
- `yls_codex_usage_0.1.0_macos_x64_app.tar.gz`
- `yls_codex_usage_0.1.0_macos_aarch64.dmg`
- `yls_codex_usage_0.1.0_macos_aarch64_app.tar.gz`

Design rules:

- use lowercase ASCII for repository, platform, architecture, and kind segments
- keep the original file extension casing only when the source artifact uses canonical casing such as `.AppImage`
- derive the version from the release tag and strip only the leading `v`
- do not include spaces
- do not include localized display names

## Workflow Design

The release workflow should keep the existing release trigger and cleanup behavior, but change the asset publishing path:

1. build with Tauri on the native runner
2. prevent duplicate old assets from remaining on the release
3. locate the generated bundle files for the current platform
4. copy them into a temporary upload directory with normalized names
5. upload only the normalized files to the target GitHub Release

The workflow should treat asset renaming as a packaging concern, not as a Tauri configuration concern.

## Verification

Verification should stay evidence-based:

- locally verify the repository still passes:
  - `pnpm test`
  - `pnpm build`
  - `cargo check --manifest-path src-tauri/Cargo.toml`
- push the workflow change
- re-push the target release tag
- inspect the GitHub Release asset list

Success criteria:

- the release workflow finishes successfully
- public asset names are ASCII and match the defined convention
- the app display name remains `Codex 用量查询`
- no business logic files are changed

## Risks And Mitigations

### Risk: wrong bundle path selection

Mitigation:

- collect files from the platform-specific Tauri output directories explicitly
- keep the mapping constrained to file types already observed in the current successful release

### Risk: duplicate assets on re-run

Mitigation:

- keep the existing release asset cleanup job before upload

### Risk: accidental behavior change in the app itself

Mitigation:

- do not modify `productName`, `identifier`, or window title
- keep all changes inside the release workflow unless a documentation update is necessary

## Expected Repository Changes

Primary change:

- `.github/workflows/release.yml`

Possible documentation touch-up if needed:

- `README.md` only if the project documents public asset naming examples

## Design Rules

- Prefer the smallest workflow change that produces stable public filenames
- Do not modify frontend or backend business logic
- Do not change installed app naming
- Do not claim platform validation beyond what the workflow and local checks actually prove
