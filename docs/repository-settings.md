# GitHub Repository Settings Recommendations

This document records the recommended GitHub repository settings for `yls_codex_usage` so the repository presentation and governance stay consistent with the files tracked in git.

## Repository profile

### Suggested repository description

> Tauri + Vue desktop app for viewing Codex usage, subscription, and balance with secure local API key storage.

### Suggested homepage

- Before release artifacts are published: `https://github.com/Yangless/yls_codex_usage#readme`
- After GitHub Releases is in regular use: point homepage to the latest release page or the project website

### Suggested topics

Add these GitHub topics:

- `tauri`
- `vue`
- `vite`
- `rust`
- `desktop-app`
- `codex`
- `usage-dashboard`
- `stronghold`
- `windows`
- `linux`
- `macos`

## Recommended labels

Create the following labels in the GitHub repository UI.

| Label | Color | Purpose |
| --- | --- | --- |
| `bug` | `d73a4a` | Confirmed or suspected defects |
| `enhancement` | `a2eeef` | Product or workflow improvements |
| `documentation` | `0075ca` | Docs-only updates |
| `security` | `b60205` | Security-sensitive work |
| `dependencies` | `5319e7` | Dependency updates |
| `github-actions` | `1d76db` | CI or workflow related changes |
| `rust` | `dea584` | Rust or Tauri host changes |
| `frontend` | `0e8a16` | Vue, UI, or frontend logic |
| `good first issue` | `7057ff` | Good starter tasks |
| `help wanted` | `008672` | Contributions explicitly requested |
| `question` | `d876e3` | Clarification requests |

## Branch protection recommendations

Apply these settings to `main`:

- Require a pull request before merging
- Require status checks to pass before merging
- Select the `Validate on Windows` workflow as a required check
- Select the `Release` workflow as a required check if you want release builds gated before merge
- Require branches to be up to date before merging
- Require conversation resolution before merging
- Restrict direct pushes if more than one maintainer is active

## Releases and versioning

Recommended lightweight process:

1. Update `CHANGELOG.md`
2. Bump version metadata when appropriate
3. Create a git tag such as `v0.1.0`
4. Let the release workflow build Windows, Linux, and macOS artifacts and attach them to GitHub Releases
5. Publish a GitHub Release with:
   - summary of changes
   - platform notes
   - known limitations
   - upgrade or migration notes if relevant

## Issue and PR hygiene

The repository now includes:

- issue templates
- pull request template
- contributing guide
- security policy
- code of conduct
- CODEOWNERS
- CI workflows

Dependabot is intentionally not enabled, so dependency updates are handled manually rather than by scheduled GitHub runs.

To keep them effective:

- close incomplete issues that ignore the template
- convert vague requests into focused issues before implementation
- ask contributors to include a real test plan in every PR
- keep scope small and avoid mixed-purpose pull requests
