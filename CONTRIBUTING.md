# Contributing

Thanks for your interest in contributing to `yls_codex_usage`.

This repository contains a Tauri 2 + Vue 3 desktop application for viewing Codex usage information. Contributions are welcome, but changes should stay focused, reviewable, and aligned with the current platform support described in `README.md`.

## Before you start

- Search existing issues and pull requests before opening a new one.
- For security-sensitive problems, do **not** open a public issue. Follow `SECURITY.md` instead.
- If you want to propose a larger change, open an issue first so the scope can be discussed before implementation.

## Development environment

You will need:

- Node.js 20+
- `pnpm` 8.15.9
- Rust toolchain
- MSVC Build Tools on Windows

## Local setup

```bash
pnpm install
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
```

To run the desktop app locally:

```bash
pnpm tauri dev
```

## Contribution guidelines

### Keep changes focused

Please avoid mixing unrelated work in one pull request. A good PR should usually do one of the following:

- fix one bug
- improve one workflow
- update one document set
- add one clearly scoped feature

### Do not include local artifacts

Do not commit:

- secrets or API keys
- `.env` files with real values
- generated build output
- local IDE settings unrelated to the project

### Respect current support boundaries

The repository currently documents verified support for Windows and Linux desktop workflows. If you contribute macOS changes, clearly state what was and was not tested.

## Pull request checklist

Before opening a PR, run:

```bash
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
```

In your PR description, include:

- what changed
- why the change was needed
- how you tested it
- screenshots or recordings, if UI behavior changed

## Documentation contributions

Documentation-only improvements are welcome, especially for:

- setup clarity
- platform support notes
- troubleshooting
- security reporting and repository workflow

## Review expectations

Maintainers may ask contributors to:

- narrow PR scope
- split unrelated changes
- add or update tests
- clarify platform assumptions
- update documentation

Thank you for helping improve the repository.
