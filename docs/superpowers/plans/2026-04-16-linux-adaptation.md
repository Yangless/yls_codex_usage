# Linux Desktop Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the remaining Linux desktop verification work for `yls_codex_usage` on `Ubuntu 24.04.3 LTS` and keep public support claims evidence-based.

**Architecture:** Keep `src/features/codex-usage` host-agnostic, keep runtime-specific behavior inside `src/platform/tauri/*` and `src-tauri/*`, and update documentation only after the exact Linux checks have actually run.

**Tech Stack:** Vue 3, Vite 6, Vitest, Tauri 2, Rust, Ubuntu 24.04, Tauri Store, Tauri Stronghold

---

### Task 1: Reconfirm Linux Baseline In Ubuntu 24.04

**Files:**
- Reference: `README.md`
- Reference: `AGENTS.md`
- Reference: `docs/context/resume.md`
- Reference: `src-tauri/Cargo.toml`

- [ ] **Step 1: Re-run the current baseline verification commands**

Run on the verified Ubuntu 24.04 machine:

```bash
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
```

Expected:
- all commands exit `0`
- no new Linux-specific compile/runtime blocker appears

- [ ] **Step 2: Record the exact environment used**

Capture before changing support claims:
- distro: `Ubuntu 24.04.3 LTS`
- whether verification is dev-runtime only or also package-level
- any warnings observed during launch/build

- [ ] **Step 3: Stop if the baseline regresses**

If any command fails, record:
- exact command
- exact stderr/stdout
- whether the issue is environment-specific or repository-specific

Do not broaden docs or support claims until the regression is understood.

### Task 2: Finish Linux Manual Business Smoke

**Files:**
- Reference: `src/App.vue`
- Reference: `src/features/codex-usage/service.ts`
- Reference: `src/platform/visual-environment.ts`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `docs/context/resume.md`

- [ ] **Step 1: Launch the Linux desktop runtime**

Run:

```bash
pnpm tauri dev
```

Expected:
- Vite starts
- the Tauri window opens
- the app remains usable after focus changes

- [ ] **Step 2: Execute the pending manual business smoke checklist**

Verify end-to-end:
- save a valid key
- save an invalid key
- click refresh
- restart the app
- verify key reloads
- verify `pollInterval` reloads
- verify backend `msg` still surfaces

- [ ] **Step 3: Record Linux-specific findings precisely**

Capture only observed facts such as:
- launch/render issues
- `libEGL` / `MESA` warnings
- persistence path behavior
- packaged vs dev-runtime differences

- [ ] **Step 4: Update docs only if business smoke actually passed**

If and only if the checklist passes, sync:
- `README.md`
- `AGENTS.md`
- `docs/context/resume.md`

Required updates:
- move Linux manual business smoke from pending to verified
- list exact commands and smoke coverage
- keep any remaining caveats explicit

### Task 3: Verify Linux Packaging And Install Path

**Files:**
- Reference: `src-tauri/tauri.conf.json`
- Reference: `src-tauri/icons/*`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `docs/context/resume.md`

- [ ] **Step 1: Build the Linux release artifact**

Run:

```bash
pnpm tauri build
```

Expected:
- build exits `0`
- Linux release artifacts are generated successfully

- [ ] **Step 2: Launch the packaged Linux artifact directly**

Verify the packaged app can:
- open correctly
- refresh usage data
- preserve saved key and interval after restart

- [ ] **Step 3: Record packaging caveats instead of overclaiming**

Document:
- exact artifact type launched
- any prerequisite native libraries
- any issue that still blocks broader Linux packaging claims

- [ ] **Step 4: Sync public wording after package verification**

Only after success, update docs to distinguish:
- command/build verification
- manual business smoke verification
- packaged artifact verification

### Task 4: Apply Minimal Linux-Specific Fixes Only If A Real Blocker Appears

**Files:**
- Modify: `src/platform/tauri/*`
- Modify: `src-tauri/*`
- Modify: `src/platform/visual-environment.ts`
- Test: `src/platform/__tests__/visual-environment.test.ts`
- Test: `src/features/codex-usage/__tests__/*`

- [ ] **Step 1: Reproduce one Linux issue at a time**

For each blocker, save:
- exact command used
- exact error text
- whether it is build-time, launch-time, render-time, or storage-time

- [ ] **Step 2: Write or extend a focused test first when behavior changes**

Examples:

```bash
pnpm vitest run src/platform/__tests__/visual-environment.test.ts
pnpm vitest run src/features/codex-usage/__tests__/service.test.ts
```

Expected:
- the focused test demonstrates the Linux-specific behavior being fixed

- [ ] **Step 3: Keep the fix inside the platform boundary**

Rules:
- do not push Linux conditionals into feature logic unless unavoidable
- prefer `src/platform/tauri/*`, `src/platform/visual-environment.ts`, and `src-tauri/*`
- do not refactor unrelated files

- [ ] **Step 4: Re-run verification after each accepted fix**

Run:

```bash
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
```

Expected:
- all commands exit `0`
- the reproduced Linux issue is resolved
