# yls_codex_usage Naming And Resume Audit

## Canonical Names

- Repository/package technical name: `yls_codex_usage`
- App display name: `Codex 用量查询`
- Bundle identifier: `com.ylsagi.codexusage`

## Local Workspace Reality

- The local folder in this machine is still `yls_codex_usage`
- That folder name does not block build or runtime
- Project docs should describe both the canonical package name and the current local folder when needed, instead of assuming a rename already happened

## Resume Design

The repo keeps three stable entry points for future sessions:

- `AGENTS.md`
- `docs/context/resume.md`
- `README.md`

These files must stay aligned whenever project naming, runtime status, or storage behavior changes.

## Documentation Rule

When updating docs, prefer:

- actual verified platform status
- actual on-disk persistence paths
- current app/runtime names from `package.json` and `src-tauri/tauri.conf.json`

Do not document planned folder renames or unsupported targets as if they were already live.
