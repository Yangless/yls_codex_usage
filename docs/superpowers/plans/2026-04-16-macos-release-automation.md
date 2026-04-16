# macOS Release Automation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide a professional GitHub Actions path for macOS desktop release builds of `yls_codex_usage`, while keeping repository claims evidence-based until the first successful workflow run is observed.

**Architecture:** Release automation should live in `.github/workflows/*`, keep application code unchanged unless a real build blocker is discovered, and update public documentation only after the workflow configuration is settled and validated.

**Tech Stack:** GitHub Actions, Tauri 2, Vue 3, Vite 6, Rust, pnpm, `tauri-apps/tauri-action`

---

### Task 1: Define The macOS Release Trigger Strategy

**Files:**
- Modify: `.github/workflows/release-macos.yml`
- Modify: `README.md`
- Modify: `docs/repository-settings.md`

- [ ] **Step 1: Use a release-oriented trigger instead of every push**

Target behavior:
- allow `workflow_dispatch`
- allow version-tag builds such as `v*`
- avoid creating draft releases for every push to `main`

- [ ] **Step 2: Keep public docs aligned with actual automation**

Document the workflow as:
- configured
- awaiting first successful run if not yet executed
- producing GitHub Release assets only when the release workflow runs

### Task 2: Harden The GitHub Actions Job

**Files:**
- Modify: `.github/workflows/release-macos.yml`
- Reference: `package.json`
- Reference: `src-tauri/tauri.conf.json`

- [ ] **Step 1: Keep the macOS build environment explicit**

Workflow requirements:
- `actions/checkout@v4`
- `pnpm/action-setup@v4`
- `actions/setup-node@v4` with pnpm cache
- stable Rust toolchain
- Rust cache
- `pnpm install --frozen-lockfile`

- [ ] **Step 2: Use Tauri Action for artifact publishing**

Required behavior:
- build the macOS desktop artifact
- publish artifacts through GitHub Releases
- keep release metadata readable and stable

- [ ] **Step 3: Avoid unverified over-configuration**

Until the workflow is actually run successfully:
- do not claim the generated artifact type was verified manually
- do not claim notarization/signing is configured unless secrets and Apple credentials are actually added

### Task 3: Add Release Metadata That Fits A Public Repository

**Files:**
- Modify: `.github/workflows/release-macos.yml`
- Modify: `README.md`
- Modify: `docs/repository-settings.md`

- [ ] **Step 1: Use version-tag-based release names**

Recommended conventions:
- tag pattern: `v*`
- release title derived from the Git tag
- concise release notes body that tells users to download attached desktop assets

- [ ] **Step 2: Keep the README wording precise**

State:
- macOS desktop CI/release automation is configured
- verification will be complete after the first successful GitHub Actions run

### Task 4: Validate And Follow Up After First Workflow Run

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `docs/context/resume.md`
- Modify: `docs/repository-settings.md`

- [ ] **Step 1: Observe the first real workflow run**

Capture:
- workflow URL or run identifier
- tag used
- whether release assets were attached successfully
- any macOS-specific build failures

- [ ] **Step 2: Update docs only after actual evidence exists**

If the workflow succeeds, sync docs to say:
- the macOS release workflow has been verified
- which target architecture was built
- any remaining unsigned/notarization caveats

- [ ] **Step 3: If the workflow fails, keep the claim partial**

Document the actual state as:
- workflow configured
- first run failed or still pending
- manual follow-up required before broadening support claims
