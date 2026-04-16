# Three-Platform Release Distribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `yls_codex_usage` through one SemVer tag-driven GitHub Release that carries Windows, macOS, and Linux desktop artifacts.

**Architecture:** Keep release logic in `.github/workflows/*` and repository docs, not in app business code. Use one shared tag format (`v*`), native GitHub runners per OS, and one release record that all three workflows publish into.

**Tech Stack:** GitHub Actions, Tauri 2, pnpm, Rust, GitHub Releases, Markdown docs

---

### Task 1: Normalize shared release conventions and finalize macOS workflow

**Files:**
- Modify: `.github/workflows/release-macos.yml`
- Modify: `docs/repository-settings.md`
- Modify: `README.md`
- Reference: `package.json`
- Reference: `src-tauri/tauri.conf.json`

- [ ] **Step 1: Replace the macOS workflow with the shared release shape**

Write this file content to `.github/workflows/release-macos.yml`:

```yml
name: Release macOS

on:
  push:
    tags:
      - "v*"
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: release-macos-${{ github.ref }}
  cancel-in-progress: true

jobs:
  release-macos:
    name: Build and release on macOS
    runs-on: macos-latest
    timeout-minutes: 30

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8.15.9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          cache-dependency-path: pnpm-lock.yaml

      - name: Setup Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: aarch64-apple-darwin

      - name: Cache Rust build artifacts
        uses: Swatinem/rust-cache@v2
        with:
          workspaces: src-tauri

      - name: Install frontend dependencies
        run: pnpm install --frozen-lockfile

      - name: Build and publish macOS release assets
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: Codex Usage ${{ github.ref_name }}
          releaseBody: |
            Automated desktop release for ${{ github.ref_name }}.

            This release is expected to contain Windows, macOS, and Linux artifacts.
          releaseDraft: true
          prerelease: false
          args: --target aarch64-apple-darwin
```

- [ ] **Step 2: Read the workflow back and check the required invariants**

Check that the file now contains all of these exact patterns:

```text
on.push.tags -> "v*"
workflow_dispatch
permissions.contents -> write
concurrency.group -> release-macos-${{ github.ref }}
tagName -> ${{ github.ref_name }}
releaseName -> Codex Usage ${{ github.ref_name }}
args -> --target aarch64-apple-darwin
```

Expected: every item is present exactly once.

- [ ] **Step 3: Update repository settings guidance for three-platform releases**

In `docs/repository-settings.md`, replace the “Releases and versioning” section with this content:

```md
## Releases and versioning

Recommended process:

1. Update `CHANGELOG.md`
2. Bump version in both `package.json` and `src-tauri/tauri.conf.json`
3. Commit the version change
4. Create and push a git tag such as `v0.1.0`
5. Let the Windows, macOS, and Linux release workflows attach assets to the same GitHub Release
6. Publish the GitHub Release after checking:
   - all expected platform assets are attached
   - release notes are readable
   - known platform caveats are documented
```

- [ ] **Step 4: Add a release automation note to the README**

Under `## 常用命令` in `README.md`, add this new section:

```md
## Release 流程

- 版本号使用三段式语义化版本：`MAJOR.MINOR.PATCH`
- 发布时同步更新：`package.json`、`src-tauri/tauri.conf.json`、`CHANGELOG.md`
- 通过推送 `v*` tag 触发 GitHub Actions 三平台构建
- GitHub Releases 统一分发 Windows、macOS、Linux 桌面产物
- 平台构建成功不等于所有业务链路都已人工验证，平台说明以 README 当前验证范围为准
```

- [ ] **Step 5: Run repository baseline verification**

Run:

```bash
pnpm test
pnpm build
cargo check --locked --manifest-path src-tauri/Cargo.toml
```

Expected:
- all commands exit `0`
- workflow/doc changes did not break the current baseline

- [ ] **Step 6: Commit the shared release convention changes**

Run:

```bash
git add .github/workflows/release-macos.yml docs/repository-settings.md README.md
git commit -m "build: align macOS release workflow with shared tagging"
```

Expected: one commit created with only the three files above.

### Task 2: Add the Windows release workflow

**Files:**
- Create: `.github/workflows/release-windows.yml`
- Modify: `README.md`
- Modify: `docs/repository-settings.md`
- Reference: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the Windows release workflow**

Write this file to `.github/workflows/release-windows.yml`:

```yml
name: Release Windows

on:
  push:
    tags:
      - "v*"
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: release-windows-${{ github.ref }}
  cancel-in-progress: true

jobs:
  release-windows:
    name: Build and release on Windows
    runs-on: windows-latest
    timeout-minutes: 30

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8.15.9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          cache-dependency-path: pnpm-lock.yaml

      - name: Setup Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: x86_64-pc-windows-msvc

      - name: Cache Rust build artifacts
        uses: Swatinem/rust-cache@v2
        with:
          workspaces: src-tauri

      - name: Install frontend dependencies
        run: pnpm install --frozen-lockfile

      - name: Build and publish Windows release assets
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: Codex Usage ${{ github.ref_name }}
          releaseBody: |
            Automated desktop release for ${{ github.ref_name }}.

            This release is expected to contain Windows, macOS, and Linux artifacts.
          releaseDraft: true
          prerelease: false
          args: --target x86_64-pc-windows-msvc
```

- [ ] **Step 2: Verify the Windows workflow matches the macOS release contract**

Read `.github/workflows/release-windows.yml` and confirm these exact invariants:

```text
name -> Release Windows
on.push.tags -> "v*"
permissions.contents -> write
concurrency.group -> release-windows-${{ github.ref }}
tagName -> ${{ github.ref_name }}
releaseName -> Codex Usage ${{ github.ref_name }}
args -> --target x86_64-pc-windows-msvc
```

Expected: every invariant is present exactly once.

- [ ] **Step 3: Extend public docs to mention Windows release automation**

Update the README platform matrix row for Windows to this wording:

```md
| Windows Desktop | 已验证 + 已配置 Release | `pnpm test`、`pnpm build`、`cargo check`、桌面端手工保存/刷新/重启读取、GitHub Actions Release 工作流 | 当前主要支持平台 |
```

In `docs/repository-settings.md`, update the branch-protection bullets so this sentence appears:

```md
- Select the Windows validation workflow as a required check
- Keep release workflows optional for merge gating unless you explicitly want release packaging to block normal development merges
```

- [ ] **Step 4: Re-run the existing baseline checks**

Run:

```bash
pnpm test
pnpm build
cargo check --locked --manifest-path src-tauri/Cargo.toml
```

Expected: all commands exit `0`.

- [ ] **Step 5: Commit the Windows release workflow**

Run:

```bash
git add .github/workflows/release-windows.yml README.md docs/repository-settings.md
git commit -m "build: add Windows release workflow"
```

Expected: one commit created with only the three files above.

### Task 3: Add the Linux release workflow

**Files:**
- Create: `.github/workflows/release-linux.yml`
- Modify: `README.md`
- Modify: `docs/repository-settings.md`
- Reference: `src-tauri/tauri.conf.json`

- [ ] **Step 1: Create the Linux release workflow with explicit system dependencies**

Write this file to `.github/workflows/release-linux.yml`:

```yml
name: Release Linux

on:
  push:
    tags:
      - "v*"
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: release-linux-${{ github.ref }}
  cancel-in-progress: true

jobs:
  release-linux:
    name: Build and release on Linux
    runs-on: ubuntu-latest
    timeout-minutes: 35

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install Linux system dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y \
            libwebkit2gtk-4.1-dev \
            build-essential \
            curl \
            wget \
            file \
            libxdo-dev \
            libssl-dev \
            libayatana-appindicator3-dev \
            librsvg2-dev \
            patchelf

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 8.15.9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          cache-dependency-path: pnpm-lock.yaml

      - name: Setup Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: x86_64-unknown-linux-gnu

      - name: Cache Rust build artifacts
        uses: Swatinem/rust-cache@v2
        with:
          workspaces: src-tauri

      - name: Install frontend dependencies
        run: pnpm install --frozen-lockfile

      - name: Build and publish Linux release assets
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: Codex Usage ${{ github.ref_name }}
          releaseBody: |
            Automated desktop release for ${{ github.ref_name }}.

            This release is expected to contain Windows, macOS, and Linux artifacts.
          releaseDraft: true
          prerelease: false
          args: --target x86_64-unknown-linux-gnu
```

- [ ] **Step 2: Verify the Linux workflow contains the required dependency install step**

Read `.github/workflows/release-linux.yml` and confirm these exact patterns:

```text
name -> Release Linux
runs-on -> ubuntu-latest
Install Linux system dependencies
libwebkit2gtk-4.1-dev
libayatana-appindicator3-dev
patchelf
args -> --target x86_64-unknown-linux-gnu
```

Expected: every pattern is present exactly once.

- [ ] **Step 3: Extend public docs to mention Linux release automation without overclaiming support**

Update the README platform matrix row for Linux to this wording:

```md
| Linux Desktop | 部分验证 + 已配置 Release | `pnpm test`、`pnpm build`、`cargo check`、`pnpm tauri dev` 启动、`pnpm tauri build`、GitHub Actions Release 工作流 | 业务链路手工烟测仍未补齐 |
```

In `docs/repository-settings.md`, replace the homepage recommendation bullets with this text:

```md
### Suggested homepage

- Before the first public release: `https://github.com/Yangless/yls_codex_usage#readme`
- After stable release publishing begins: point homepage to the latest GitHub Release or the project website
```

- [ ] **Step 4: Re-run the existing baseline checks**

Run:

```bash
pnpm test
pnpm build
cargo check --locked --manifest-path src-tauri/Cargo.toml
```

Expected: all commands exit `0`.

- [ ] **Step 5: Commit the Linux release workflow**

Run:

```bash
git add .github/workflows/release-linux.yml README.md docs/repository-settings.md
git commit -m "build: add Linux release workflow"
```

Expected: one commit created with only the three files above.

### Task 4: Align release documentation and versioning procedure

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `docs/repository-settings.md`
- Modify: `docs/context/resume.md`
- Modify: `AGENTS.md`
- Reference: `package.json`
- Reference: `src-tauri/tauri.conf.json`

- [ ] **Step 1: Update the roadmap and release wording in the README**

Replace the `## Roadmap` section in `README.md` with this content:

```md
## Roadmap

- Linux：补一次人工业务烟测，确认保存 key、刷新与重启读取链路
- Release：完成 Windows、macOS、Linux 三平台首个 tag 驱动的 GitHub Release 验证
- macOS：如需面向更广泛终端用户分发，再补 Apple 签名与 notarization
```

- [ ] **Step 2: Add a top changelog entry template for the first multi-platform release**

At the top of `CHANGELOG.md`, add this block:

```md
## [0.1.0] - 2026-04-16

### Added
- Tag-driven GitHub Release workflow for Windows, macOS, and Linux desktop artifacts.

### Changed
- Standardized release process around SemVer versioning and GitHub Releases.

### Notes
- macOS signing/notarization is not included in the first iteration.
- Linux release artifacts remain subject to distribution-specific compatibility.
```

- [ ] **Step 3: Update internal docs to reflect the new release model**

Append this subsection to `docs/context/resume.md`:

```md
## Release Automation Status

- Versioning model: `SemVer` (`MAJOR.MINOR.PATCH`)
- Release trigger: git tag `v*`
- Planned release workflows:
  - `.github/workflows/release-windows.yml`
  - `.github/workflows/release-macos.yml`
  - `.github/workflows/release-linux.yml`
- Public distribution channel: GitHub Releases
- A configured workflow is not the same thing as a verified runtime/business smoke result
```

Append this subsection to `AGENTS.md`:

```md
## Release Rules

- Keep `package.json` and `src-tauri/tauri.conf.json` versions identical before a release tag is pushed
- Use `v*` tags to trigger public desktop release builds
- Do not describe release automation as verified until at least one real workflow run succeeds
- Do not treat published Linux artifacts as proof of universal Linux compatibility
```

- [ ] **Step 4: Run a focused doc consistency check**

Search for these exact patterns across the repo docs:

```text
SemVer
v*
release-windows.yml
release-macos.yml
release-linux.yml
GitHub Releases
```

Expected: the new release model is documented in public and internal guidance.

- [ ] **Step 5: Commit the release documentation changes**

Run:

```bash
git add README.md CHANGELOG.md docs/repository-settings.md docs/context/resume.md AGENTS.md
git commit -m "docs: document three-platform release process"
```

Expected: one docs-only commit created.

### Task 5: Execute the first tagged release validation

**Files:**
- Modify: `package.json`
- Modify: `src-tauri/tauri.conf.json`
- Modify: `CHANGELOG.md`
- Modify: `README.md`
- Modify: `docs/repository-settings.md`
- Modify: `docs/context/resume.md`
- Modify: `AGENTS.md`
- Reference: `.github/workflows/release-windows.yml`
- Reference: `.github/workflows/release-macos.yml`
- Reference: `.github/workflows/release-linux.yml`

- [ ] **Step 1: Choose the first release version and synchronize both version files**

For the first public three-platform release, set both files to the same value. Example for `0.1.0`:

```json
// package.json
{
  "version": "0.1.0"
}
```

```json
// src-tauri/tauri.conf.json
{
  "version": "0.1.0"
}
```

Expected: both files match exactly.

- [ ] **Step 2: Re-run the local baseline before any tag is pushed**

Run:

```bash
pnpm test
pnpm build
cargo check --locked --manifest-path src-tauri/Cargo.toml
```

Expected: all commands exit `0`.

- [ ] **Step 3: Commit the versioned release state**

Run:

```bash
git add package.json src-tauri/tauri.conf.json CHANGELOG.md
git commit -m "chore: prepare v0.1.0 release"
```

Expected: one commit created for the versioned release state.

- [ ] **Step 4: Stop and ask the maintainer to confirm the remote release should be created**

Use this exact checkpoint message:

```text
Local release preparation is complete. The next step will push tag v0.1.0 to the remote and trigger public GitHub Release workflows for Windows, macOS, and Linux. Confirm before proceeding.
```

Expected: explicit approval before any remote tag push.

- [ ] **Step 5: Create and push the release tag after confirmation**

Run:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Expected:
- the tag exists on the remote
- all three release workflows start in GitHub Actions

- [ ] **Step 6: Verify the GitHub Release is populated by all three workflows**

Check the release for `v0.1.0` and confirm:

```text
Windows asset attached
macOS asset attached
Linux asset attached
Release title is "Codex Usage v0.1.0"
Release remains draft until manual publish review
```

Expected: every item is true before the release is published.

- [ ] **Step 7: Update docs with observed evidence from the first real run**

After the workflows finish, replace provisional wording with evidence-based notes. Update these files with the exact tag and observed result:

```md
- First verified three-platform release tag: `v0.1.0`
- Verified release workflows: Windows / macOS / Linux
- Observed distribution caveats: macOS unsigned build warning if present; Linux distro-specific compatibility if observed
```

Apply that evidence to:
- `README.md`
- `docs/repository-settings.md`
- `docs/context/resume.md`
- `AGENTS.md`

- [ ] **Step 8: Commit the post-release evidence updates**

Run:

```bash
git add README.md docs/repository-settings.md docs/context/resume.md AGENTS.md
git commit -m "docs: record first three-platform release verification"
```

Expected: one commit created with evidence-based follow-up wording.
