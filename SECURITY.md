# Security Policy

## Supported versions

Security support is provided for the latest state of the `main` branch unless a tagged release policy is added later.

## Reporting a vulnerability

Please do **not** report security issues through public GitHub issues.

If you discover a vulnerability related to any of the following areas, report it privately to the maintainer:

- API key handling
- local secret persistence
- Tauri Stronghold integration
- desktop runtime permissions
- dependency or supply-chain risk affecting this repository

When reporting, include:

- a clear description of the issue
- impact and attack scenario
- reproduction steps or proof of concept
- affected environment and version
- any suggested mitigation, if known

## Response expectations

The maintainer will review the report, confirm scope, and determine remediation steps. Public disclosure should wait until a fix or mitigation is available.

## Security boundaries

This project aims to avoid storing API keys in browser local storage and instead uses Tauri-side local storage mechanisms for desktop usage. However, no software can guarantee absolute security on a compromised machine. Users should treat endpoint security, OS account security, and key lifecycle management as part of their own operational responsibility.
