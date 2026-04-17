# Release Asset Renaming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish GitHub Release assets with stable ASCII filenames while keeping the app display name `Codex 用量查询` unchanged.

**Architecture:** Keep the naming change inside `.github/workflows/release.yml`. Let Tauri continue building native bundles with the current app metadata, then collect the generated files into a staging directory, rename them to repository-controlled ASCII names, and upload only the renamed files to the GitHub Release.

**Tech Stack:** GitHub Actions, Tauri 2, pnpm, Rust, GitHub Releases, PowerShell, Bash

---

### Task 1: Replace default release upload naming with explicit staged assets

**Files:**
- Modify: `.github/workflows/release.yml`
- Reference: `src-tauri/tauri.conf.json`
- Reference: `docs/superpowers/specs/2026-04-17-release-asset-renaming-design.md`

- [ ] **Step 1: Remove the default `tauri-action` release upload step and keep the rest of the build pipeline intact**

Replace the current upload step in `.github/workflows/release.yml` with a plain build step so Tauri only builds artifacts:

```yml
      - name: Build Tauri bundles
        run: pnpm tauri build -- ${{ matrix.tauri_args }}
```

Expected:
- the workflow still checks out code, sets up Node, pnpm, Rust, and Linux system dependencies
- the workflow no longer relies on `tauri-apps/tauri-action` to choose public asset names

- [ ] **Step 2: Add matrix metadata for release filename generation**

Extend the release matrix in `.github/workflows/release.yml` with naming metadata:

```yml
          - name: Windows x64
            os: windows-latest
            rust_targets: ""
            tauri_args: "--bundles nsis"
            asset_platform: "windows"
            asset_arch: "x64"
          - name: Linux x64
            os: ubuntu-24.04
            rust_targets: ""
            tauri_args: ""
            asset_platform: "linux"
            asset_arch: "x64"
          - name: macOS Apple Silicon
            os: macos-latest
            rust_targets: "aarch64-apple-darwin"
            tauri_args: "--target aarch64-apple-darwin"
            asset_platform: "macos"
            asset_arch: "aarch64"
          - name: macOS Intel
            os: macos-15-intel
            rust_targets: "x86_64-apple-darwin"
            tauri_args: "--target x86_64-apple-darwin"
            asset_platform: "macos"
            asset_arch: "x64"
```

Expected:
- each matrix row declares `asset_platform`
- each matrix row declares `asset_arch`
- no existing target or bundle behavior changes

- [ ] **Step 3: Add a Linux/macOS staging step that renames supported bundle outputs**

Append a Bash step after the Tauri build in `.github/workflows/release.yml`:

```yml
      - name: Stage renamed assets on Unix runners
        if: runner.os != 'Windows'
        shell: bash
        run: |
          set -euo pipefail
          version="${RELEASE_TAG#v}"
          bundle_dir="src-tauri/target/${{ matrix.rust_targets || 'release' }}/bundle"
          upload_dir="src-tauri/target/release-upload"
          rm -rf "$upload_dir"
          mkdir -p "$upload_dir"

          shopt -s nullglob

          copy_asset() {
            local source_path="$1"
            local suffix="$2"
            local target_name="yls_codex_usage_${version}_${{ matrix.asset_platform }}_${{ matrix.asset_arch }}_${suffix}"
            cp "$source_path" "$upload_dir/$target_name"
          }

          for file in "$bundle_dir"/appimage/*.AppImage; do copy_asset "$file" "appimage.AppImage"; done
          for file in "$bundle_dir"/deb/*.deb; do copy_asset "$file" "deb"; done
          for file in "$bundle_dir"/rpm/*.rpm; do copy_asset "$file" "rpm"; done
          for file in "$bundle_dir"/dmg/*.dmg; do copy_asset "$file" "dmg"; done
          for file in "$bundle_dir"/macos/*.app.tar.gz; do copy_asset "$file" "app.tar.gz"; done

          test -n "$(find "$upload_dir" -maxdepth 1 -type f -print -quit)"
```

Expected:
- Linux runner stages `.AppImage`, `.deb`, `.rpm`
- macOS runner stages `.dmg` and `.app.tar.gz`
- staged files use the `yls_codex_usage_<version>_<platform>_<arch>_<kind>` naming convention

- [ ] **Step 4: Add a Windows staging step that renames the NSIS installer**

Append a PowerShell step after the Tauri build in `.github/workflows/release.yml`:

```yml
      - name: Stage renamed assets on Windows
        if: runner.os == 'Windows'
        shell: pwsh
        run: |
          $version = $env:RELEASE_TAG -replace '^v', ''
          $bundleDir = 'src-tauri/target/release/bundle/nsis'
          $uploadDir = 'src-tauri/target/release-upload'

          if (Test-Path $uploadDir) {
            Remove-Item -LiteralPath $uploadDir -Recurse -Force
          }

          New-Item -ItemType Directory -Path $uploadDir | Out-Null

          $installer = Get-ChildItem -Path $bundleDir -Filter *.exe | Select-Object -First 1
          if (-not $installer) {
            throw 'NSIS installer not found.'
          }

          Copy-Item -LiteralPath $installer.FullName -Destination (Join-Path $uploadDir "yls_codex_usage_${version}_${{ matrix.asset_platform }}_${{ matrix.asset_arch }}_setup.exe")
```

Expected:
- Windows runner stages exactly one renamed installer
- the staged filename becomes `yls_codex_usage_<version>_windows_x64_setup.exe`

- [ ] **Step 5: Upload staged assets with the GitHub CLI upload action**

Append an upload step in `.github/workflows/release.yml`:

```yml
      - name: Upload renamed release assets
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ env.RELEASE_TAG }}
          fail_on_unmatched_files: true
          files: |
            src-tauri/target/release-upload/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Expected:
- only staged renamed files are uploaded
- release creation continues to target the existing tag
- reruns remain safe because the cleanup job still removes older assets first

- [ ] **Step 6: Read the workflow back and check the required invariants**

Check `.github/workflows/release.yml` for all of these exact ideas:

```text
Build step uses pnpm tauri build
Matrix declares asset_platform and asset_arch
Unix staging copies AppImage, deb, rpm, dmg, app.tar.gz
Windows staging copies the NSIS installer
Release upload uses softprops/action-gh-release@v2
```

Expected:
- every item above is present
- `productName` is not modified anywhere in the repository

- [ ] **Step 7: Commit the workflow renaming change**

Run:

```bash
git add .github/workflows/release.yml
git commit -m "build: normalize release asset filenames"
```

Expected: one commit created with only the workflow file

### Task 2: Verify and publish the renamed release assets

**Files:**
- Modify: `.github/workflows/release.yml`
- Reference: `docs/superpowers/specs/2026-04-17-release-asset-renaming-design.md`
- Reference: `docs/superpowers/plans/2026-04-17-release-asset-renaming.md`

- [ ] **Step 1: Run the repository baseline checks locally**

Run:

```bash
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
```

Expected:
- all commands exit `0`
- the workflow-only change does not affect app build correctness

- [ ] **Step 2: Push the workflow change and re-point the release tag**

Run:

```bash
git push origin main
git tag -f v0.1.0
git push origin -f v0.1.0
```

Expected:
- `main` contains the workflow change
- the `v0.1.0` release workflow starts again from the new commit

- [ ] **Step 3: Inspect the latest Release workflow run**

Check:

```text
https://github.com/Yangless/yls_codex_usage/actions/workflows/release.yml
https://github.com/Yangless/yls_codex_usage/releases/tag/v0.1.0
```

Expected:
- the workflow finishes successfully
- the release assets are re-uploaded with ASCII names

- [ ] **Step 4: Confirm the asset naming contract on the public release page**

Verify that the public release asset list contains ASCII names following this pattern:

```text
yls_codex_usage_0.1.0_windows_x64_setup.exe
yls_codex_usage_0.1.0_linux_x64_appimage.AppImage
yls_codex_usage_0.1.0_linux_x64.deb
yls_codex_usage_0.1.0_linux_x64.rpm
yls_codex_usage_0.1.0_macos_x64.dmg
yls_codex_usage_0.1.0_macos_x64_app.tar.gz
yls_codex_usage_0.1.0_macos_aarch64.dmg
yls_codex_usage_0.1.0_macos_aarch64_app.tar.gz
```

Expected:
- filenames contain no localized title fragments
- the app itself still uses `Codex 用量查询`

- [ ] **Step 5: Commit any follow-up workflow fix only if the first rerun shows a concrete release-path bug**

Run only if required:

```bash
git add .github/workflows/release.yml
git commit -m "fix: correct release asset staging"
```

Expected:
- no extra commit is created if the first rerun succeeds
- any follow-up change stays limited to the release workflow
