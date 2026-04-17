# yls_codex_usage Naming And Resume Maintenance Plan

## Current Status

- `package.json` uses `yls_codex_usage`
- `src-tauri/tauri.conf.json` uses product name `Codex 用量查询`
- `src-tauri/tauri.conf.json` uses identifier `com.ylsagi.codexusage`
- Root resume docs already exist and are active
- The local folder remains `yls_codex_usage`

## What Is Considered Correct

- Canonical technical naming follows package/bundle metadata
- The local folder name is documented as workspace reality, not treated as an error by itself
- Resume docs must reflect actual runtime status, not historical migration assumptions

## Future Maintenance Steps

1. If package name, app name, or bundle identifier changes, update `README.md`, `AGENTS.md`, and `docs/context/resume.md` in the same commit
2. If the local folder is renamed again, update the docs that mention the workspace path
3. If native verification status changes, update the resume docs on the same day
