# Sensitive Information Audit Design

## Summary

This task performs a report-only sensitive information audit for the current repository while preserving the requirement that the application remains in a working state.

The audit will not modify source files, configuration, history, or generated assets. It will inspect the current workspace plus git history and recent commits, then produce a cleanup report with findings, risk levels, evidence locations, likely false-positive notes, and remediation recommendations.

## Audit Objective

The goal is to determine whether the repository currently exposes or historically exposed secrets or other sensitive information that should not be present in source control or distributable artifacts.

For this repository, the most important secret class is the Codex API key. Additional classes include credentials, tokens, private keys, session material, environment secrets, machine-specific sensitive paths, and logs or generated files that may contain secret-bearing payloads.

## Scope

The audit includes:

- current tracked files in the repository
- current untracked files that are relevant to repository hygiene or release exposure
- current modified files in the working tree
- git history and recent commits reachable from the current branch
- repository hygiene controls related to secret exposure

The audit focuses on these locations and surfaces:

- source files under `src` and `src-tauri`
- root configuration such as `.gitignore`, package metadata, cargo metadata, and repo policy files
- documentation under `README.md` and `docs`
- GitHub configuration under `.github`
- generated/log-related naming patterns and whether they are ignored
- commit history content that may have introduced secrets in the past

The audit excludes:

- modifying files
- rotating secrets
- rewriting git history
- validating secrets against external services
- scanning files outside the repository directory unless they are directly referenced by the repo as tracked or untracked content

## Audit Method

The audit will proceed in five layers.

### 1. Current workspace content scan

Inspect repository files for high-risk secret patterns and sensitive literals, including:

- API keys and bearer tokens
- private key blocks
- passwords, secrets, and access tokens in config or docs
- suspicious long random-looking strings near sensitive variable names
- environment file leaks

### 2. Repository hygiene scan

Inspect whether ignore rules and repository structure reduce accidental secret commits, including:

- `.gitignore` coverage for `.env`, logs, temp outputs, build outputs, and local-only files
- examples and docs accidentally containing realistic secret values
- workflow or template files that encourage unsafe secret handling

### 3. Change-surface scan

Inspect current modified and untracked files to identify whether pending work introduces new exposure risk, even if not yet committed.

### 4. Git history scan

Inspect recent commit history and searchable reachable history for secret-like material or explicit sensitive filenames to determine whether the repository may already contain historical exposure.

### 5. Report synthesis

Produce a report organized by finding with:

- severity: high, medium, low, informational
- evidence: file path or history location
- rationale
- confidence and likely false-positive notes when applicable
- recommended remediation

## Severity Model

- High: likely real secret exposure in tracked content or history, or material that could directly enable unauthorized access
- Medium: sensitive operational detail, unsafe examples, or controls gap that meaningfully increases exposure risk
- Low: hygiene issue or ambiguous pattern with limited direct impact
- Informational: confirmed-safe patterns worth documenting so future cleanup work stays accurate

## Expected Output

The final report will contain:

1. Executive summary
2. Audit scope and limitations
3. Findings by severity
4. Historical exposure observations
5. Repository hygiene observations
6. Recommended remediation order
7. Explicit note that no files were changed during the audit

## Design Rules

- Do not change repository contents during the audit
- Do not claim a secret is valid unless it is structurally evident and locally observable; do not verify against external systems
- Distinguish confirmed findings from heuristic matches
- Prefer precise file references and commit references over generic statements
- Keep recommendations actionable and scoped to this repository
