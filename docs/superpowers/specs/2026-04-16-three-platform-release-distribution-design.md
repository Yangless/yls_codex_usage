# Three-Platform Release Distribution Design

## Summary

This design defines a professional release process for `yls_codex_usage` across `Windows + macOS + Linux` using `GitHub Actions` as the unified build system and `GitHub Releases` as the public distribution channel.

The project will use `SemVer` three-part versions (`MAJOR.MINOR.PATCH`), a `v*` git tag as the release trigger, and native per-platform GitHub runners to build distributable desktop artifacts. The design explicitly does **not** rely on one local machine producing all platform packages.

## Goals

- Publish a single GitHub Release per app version
- Attach Windows, macOS, and Linux desktop artifacts to that release
- Keep release versions consistent between frontend metadata and Tauri metadata
- Use native CI runners for each target platform
- Keep public claims evidence-based and separate from broader platform-support claims

## Non-Goals

- Apple signing and notarization in the first iteration
- Cross-compiling all targets from one developer machine
- Claiming Linux compatibility across all distributions without verification
- Expanding business logic or runtime feature scope

## Current Repository Context

Current relevant state in the repository:

- `package.json` already contains a SemVer-compatible version field
- `src-tauri/tauri.conf.json` already contains a Tauri app version field
- `.github/workflows/release-macos.yml` already exists and is moving toward tag-driven release publishing
- `README.md` already documents partial Linux verification and configured macOS release automation

This design extends that direction into a full three-platform release workflow.

## Recommended Approach

Use **one GitHub Release per version tag** and **three native build workflows**:

- `release-windows.yml`
- `release-macos.yml`
- `release-linux.yml`

All three workflows should trigger on:

- `push` tags matching `v*`
- `workflow_dispatch`

All three workflows should publish assets to the same GitHub Release associated with that tag.

## Alternatives Considered

### Option A: Three dedicated workflows publishing to one release
**Recommended**

Pros:
- Clear separation by platform
- Easier debugging and maintenance
- Native configuration per OS without heavy conditional logic
- Best fit for Tauri packaging differences

Cons:
- More workflow files

### Option B: One matrix workflow for all platforms

Pros:
- Fewer workflow files
- Centralized CI definition

Cons:
- More conditional logic
- Harder to debug when only one platform fails
- Linux packaging dependencies make the matrix less clean

### Option C: Local builds plus manual upload

Pros:
- Fastest to start
- Lower initial CI setup effort

Cons:
- Not ideal for a public repository
- Reproducibility is weaker
- Depends too much on the maintainer’s local machine state

## Versioning Design

The project will use `SemVer`:

- `MAJOR`: breaking changes
- `MINOR`: backward-compatible new functionality
- `PATCH`: backward-compatible fixes and small release corrections

Version authority must stay synchronized in:

- `package.json`
- `src-tauri/tauri.conf.json`

Release tags should use the format:

- `v0.1.0`
- `v0.1.1`
- `v0.2.0`

The Git tag is the release event. The app version inside repository files should match the tag without the leading `v`.

## Release Architecture

### 1. Source of truth

Before release:

- update version in `package.json`
- update version in `src-tauri/tauri.conf.json`
- update `CHANGELOG.md`

### 2. Release trigger

Maintainer pushes a version tag such as:

```bash
git tag v0.1.0
git push origin v0.1.0
```

### 3. CI build fan-out

GitHub Actions starts three native workflows:

- Windows runner builds Windows desktop artifacts
- macOS runner builds macOS desktop artifacts
- Ubuntu runner builds Linux desktop artifacts

### 4. Release aggregation

Each workflow uploads artifacts to the same GitHub Release for that tag.

### 5. Public download path

Users download installers/packages from GitHub Releases instead of workflow artifacts pages.

## Platform-Specific Release Responsibilities

### Windows

Build on `windows-latest`.

Expected public artifacts:
- installer-oriented Windows package(s), such as `.msi` and/or `.exe`, depending on Tauri bundling output

Distribution expectation:
- packages are intended for other Windows machines
- end users do not need Rust or Node.js installed

### macOS

Build on `macos-latest`.

Expected public artifacts:
- `.app` / `.dmg` depending on Tauri bundling output

Distribution caveat:
- unsigned or unnotarized builds may trigger Gatekeeper warnings
- successful CI packaging does not imply polished consumer installation UX

### Linux

Build on `ubuntu-latest`.

Expected public artifacts:
- Linux desktop package(s) supported by the configured Tauri bundle targets
- practical candidates include `AppImage`, `.deb`, and other native Linux outputs depending on final Tauri bundle settings

Distribution caveat:
- Linux compatibility remains distribution-dependent
- release availability should not be described as universal Linux support without broader validation

## Cross-Machine Compatibility Policy

### Supported statement

A package built on a native platform runner is intended for distribution to other machines on the **same platform family**:

- Windows artifact -> other Windows machines
- macOS artifact -> other macOS machines
- Linux artifact -> other Linux machines, subject to distro/runtime compatibility

### Unsupported statement

A single machine build is **not** the distribution strategy for all three platforms. This design does not assume:

- Windows can produce a fully supported macOS release package
- Windows can produce a fully supported Linux release package
- one package can run unchanged across all desktop operating systems

## Documentation Rules

Public documentation must distinguish between these concepts:

1. **Release automation configured**
2. **CI release build verified**
3. **Manual runtime/business smoke verified**
4. **Broad platform support claim**

Examples:
- macOS can be described as “release automation configured” before the first successful workflow run
- Linux can have release artifacts published while still documenting runtime compatibility caveats
- release publication must not be used as proof that all business flows were manually validated on every platform

## Error Handling And Failure Policy

If one platform workflow fails:

- do not silently broaden support claims
- inspect the failing platform separately
- keep successful platform assets available if the release policy allows partial publication
- document the failed platform as pending or partially configured

If version fields drift:

- treat that as a release blocker
- do not publish a release where `package.json` and `tauri.conf.json` disagree

If Linux artifacts build but fail on another distro:

- document the tested environment explicitly
- avoid universal compatibility wording

## Testing And Verification Strategy

Before the first formal three-platform release flow is declared complete, verify:

- version synchronization works across both version files
- tag-driven release triggering works
- Windows workflow publishes assets to the intended release
- macOS workflow publishes assets to the intended release
- Linux workflow publishes assets to the intended release
- release notes remain readable and stable

After the first real run, update docs with:

- exact release tag used
- which workflows succeeded
- which artifact types were produced
- any remaining signing/notarization or compatibility caveats

## Implementation Outline

1. Keep `SemVer` as the repository versioning model
2. Standardize tag-driven release publishing with `v*`
3. Finalize `release-macos.yml`
4. Add `release-windows.yml`
5. Add `release-linux.yml`
6. Ensure all workflows target the same release tag
7. Update `README.md` and `docs/repository-settings.md`
8. Perform the first tagged dry run / real release validation
9. Refine public wording based on observed results

## Recommendation

Adopt **three native GitHub Actions release workflows with one shared SemVer tag-driven GitHub Release**.

This provides the cleanest long-term release model for a Tauri desktop application and is the most appropriate design for public `Windows + macOS + Linux` distribution.
