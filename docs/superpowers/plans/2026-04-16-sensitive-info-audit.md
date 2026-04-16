# Sensitive Information Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit the repository for current and historical sensitive-information exposure without changing repository contents, then deliver a cleanup report.

**Architecture:** Use a report-only workflow that scans the current workspace, untracked and modified surfaces, repository hygiene controls, and reachable git history. Synthesize all findings into a severity-ranked report with precise evidence and remediation guidance, while avoiding any code or history changes.

**Tech Stack:** Claude Code tools, ripgrep-style search via Grep, file inspection via Read/Glob, git CLI for history review

---

## File Structure

- Create: `docs/superpowers/plans/2026-04-16-sensitive-info-audit.md`
- Read: `README.md`
- Read: `AGENTS.md`
- Read: `.gitignore`
- Read: `package.json`
- Read: `src-tauri/Cargo.toml`
- Read: `docs/repository-settings.md`
- Inspect: `.github/**/*`
- Inspect: `docs/**/*`
- Inspect: `src/**/*`
- Inspect: `src-tauri/**/*`
- Review via git: all reachable commits from `main`
- Output: final audit report in the conversation

### Task 1: Build the audit target list

**Files:**
- Read: `README.md`
- Read: `AGENTS.md`
- Read: `.gitignore`
- Read: `package.json`
- Read: `src-tauri/Cargo.toml`
- Inspect: `.github/**/*`
- Inspect: `docs/**/*`
- Inspect: `src/**/*`
- Inspect: `src-tauri/**/*`

- [ ] **Step 1: Confirm the high-value repository surfaces**

Run these reads and listings:

```text
Read README.md
Read AGENTS.md
Read .gitignore
Read package.json
Read src-tauri/Cargo.toml
Glob .github/**/*
Glob docs/**/*
Glob src/**/*
Glob src-tauri/**/*
```

Expected: a concrete list of code, docs, workflow, and packaging files that could leak secrets or operationally sensitive values.

- [ ] **Step 2: Note the repository-specific secret model**

Capture these facts from the inspected files:

```text
- Codex API key is the primary secret class.
- Tauri Stronghold is the intended local storage mechanism.
- settings.json stores non-secret settings such as pollInterval.
- Repository docs may describe storage locations and runtime behavior.
```

Expected: the audit is grounded in this repo's actual threat surface rather than generic secret scanning.

### Task 2: Scan the current workspace for sensitive material

**Files:**
- Inspect: `src/**/*`
- Inspect: `src-tauri/**/*`
- Inspect: `docs/**/*`
- Inspect: `.github/**/*`
- Inspect: root config files

- [ ] **Step 1: Search for explicit secret-bearing keywords**

Run Grep searches with these patterns:

```text
(api[_-]?key|token|secret|password|passwd|authorization|bearer)
(BEGIN [A-Z ]*PRIVATE KEY)
(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9\-]{20,})
```

Limit search to repository files and exclude dependency directories.

Expected: either no matches, or a small set of candidate findings with exact file paths and line numbers.

- [ ] **Step 2: Search for suspicious secret assignments in docs and config**

Run Grep searches with these patterns:

```text
(?i)(api[_-]?key|token|secret|password)\s*[:=]\s*['\"][^'\"]{8,}['\"]
(?i)(authorization|bearer)\s*[:=]\s*['\"][^'\"]+['\"]
```

Search these areas first:

```text
README.md
.docs
.github
package.json
src
src-tauri
```

Expected: flag any hardcoded-looking values and separate real assignments from placeholders or descriptive text.

- [ ] **Step 3: Search for committed environment-style files and examples**

Run file and content checks for:

```text
.env
.env.*
*.pem
*.key
*.p12
*.pfx
*.cer
*.crt
*.kdbx
```

Expected: confirm whether real secret-bearing file types are present in the repo or only ignored by policy.

### Task 3: Audit repository hygiene and current change surface

**Files:**
- Read: `.gitignore`
- Inspect: current modified and untracked files
- Inspect: `.github/**/*`
- Inspect: `docs/**/*`

- [ ] **Step 1: Review ignore coverage for accidental secret commits**

Check `.gitignore` against this list:

```text
.env
.env.*
logs
*.log
build outputs
temporary screenshots
local editor state
runtime-generated secret stores
```

Expected: document which secret-prone artifacts are already ignored and which are missing.

- [ ] **Step 2: Inspect current modified and untracked files for new exposure risk**

Run these git commands:

```bash
git status --short
git diff -- .
git diff --cached -- .
```

Expected: identify whether pending edits or new files introduce sensitive literals, unsafe examples, or policy regressions.

- [ ] **Step 3: Inspect GitHub workflows and templates for unsafe secret handling**

Review `.github/**/*` for patterns such as:

```text
hardcoded tokens
printing secrets to logs
unsafe example environment variables
release steps that may package local secret stores
```

Expected: either confirm safe usage of GitHub secrets and clean workflows, or produce medium/low-severity hygiene findings.

### Task 4: Scan reachable git history for historical exposure

**Files:**
- Review via git: all reachable commits from `main`

- [ ] **Step 1: Review recent commit metadata and touched paths**

Run:

```bash
git log --oneline --decorate --graph --all -n 50
git log --stat --all -- .
```

Expected: understand whether historical commits touched `.env`-like files, secret stores, logs, or suspicious filenames.

- [ ] **Step 2: Search history diffs for explicit secret patterns**

Run targeted history searches such as:

```bash
git log -p --all -G "api[_-]?key|token|secret|password|BEGIN [A-Z ]*PRIVATE KEY|ghp_|github_pat_|AKIA|sk-" -- .
```

Expected: surface any commits that introduced or removed sensitive material, with commit hashes for the report.

- [ ] **Step 3: Search history trees for suspicious filenames**

Run targeted path searches such as:

```bash
git log --all --name-only --pretty=format: -- . | sort -u
```

Then inspect whether historical paths include names like:

```text
.env
secrets
credentials
id_rsa
*.pem
*.key
vault.hold
settings.json
```

Expected: identify whether sensitive files were ever committed, even if they are absent now.

### Task 5: Produce the cleanup report

**Files:**
- Reference: all evidence collected in Tasks 1-4
- Output: final conversation response only

- [ ] **Step 1: Classify each candidate finding**

Use this severity rubric:

```text
High: likely real secret exposure in tracked content or history
Medium: unsafe examples, sensitive operational detail, or controls gaps
Low: hygiene issue with limited direct impact
Informational: confirmed-safe pattern or notable non-finding
```

Expected: every finding has a severity, evidence location, rationale, and confidence note.

- [ ] **Step 2: Write the report in a fixed structure**

Use this response structure:

```text
1. Executive summary
2. Scope and method
3. Findings by severity
4. Historical exposure observations
5. Repository hygiene observations
6. Remediation recommendations in priority order
7. Explicit note that no files were changed
```

Expected: the user receives a decision-ready cleanup report instead of raw scan output.

- [ ] **Step 3: Verify the report does not overclaim**

Before sending the report, check these rules:

```text
- Do not claim a token is valid.
- Mark heuristic-only matches as possible false positives.
- Cite exact paths and commit hashes.
- Distinguish current exposure from historical exposure.
- State clearly that the audit was report-only.
```

Expected: the final report is precise, defensible, and safe.
