# yls_codex_usage

`Codex 用量查询` 是一个基于 `Tauri 2 + Vue 3 + Vite` 的桌面用量查询应用。当前这份仓库已经切到 Tauri 宿主，实际在本机打通过的是 `Windows` 桌面链路；`Linux` 与 `iOS` 仍保留为后续目标，但还没有在这个工作区完成验证。

## Features

- 保存 API key，并在应用重启后重新加载
- 查询订阅、余额、今日用量与本周用量
- 支持手动刷新与定时轮询
- 后端返回 `msg` 时直接展示真实错误信息
- 变更新 key 时先立即生效，再在后台加密持久化，避免保存按钮长时间卡死
- 同一个 key 重复保存时跳过 Stronghold 写入

## Key 与配置保存位置

Tauri 桌面端已经不再使用 `localStorage` 保存密钥。

- 刷新频率保存到 Tauri Store：
  - Windows 实际路径：`%APPDATA%\com.ylsagi.codexusage\settings.json`
- API key 保存到 Tauri Stronghold：
  - Windows 实际路径：`%APPDATA%\com.ylsagi.codexusage\vault.hold`
- Stronghold 可能会生成一些伴随文件，例如 `vault.hold.*`
- 代码层面的实现位置：
  - `src/platform/tauri/storage.tauri.ts`
  - Stronghold client name: `codex-usage`
  - secret entry key: `api-key`

## Windows 开发前提

在 Windows 上运行 Tauri 版本，需要这些前提：

- Rust toolchain
- MSVC Build Tools
- Node.js 与 `pnpm`

## 开发与运行

```bash
pnpm install
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
pnpm tauri dev
```

如果只验证前端逻辑，可运行：

```bash
pnpm test
pnpm build
```

## 构建

```bash
pnpm build
pnpm tauri build
```

## Architecture

- `src/features/codex-usage`: 用量查询业务逻辑、轮询、错误处理、测试
- `src/platform`: 平台契约与 `web/tauri` 适配层
- `src-tauri`: Tauri 宿主、权限配置和 Rust 初始化

## 当前运行时行为

- 请求目标：`https://code.ylsagi.com/codex/info`
- 旧 key 与新 key 的并发刷新已加保护，只有最后一次请求可以写回界面状态
- Windows 下 Stronghold 冷启动可能偏慢，因此现在会：
  - 启动时预热 Stronghold
  - 复用已加载的 Stronghold client
  - 对未变更的 key 跳过保存
  - 对变更后的 key 走“立即查询，后台加密落盘”的流程

## 当前验证范围

已验证：

- `pnpm test`
- `pnpm build`
- `cargo check --manifest-path src-tauri/Cargo.toml`
- Windows Tauri 桌面手工保存/刷新/重启读取

未验证：

- Linux 桌面打包与烟测
- iOS `tauri ios init/dev`

## Windows Smoke Checklist

- 保存有效 key 后可以立即拿到数据
- 使用无效 key 时会显示后端返回的真实错误
- 修改刷新频率后重启仍然保留
- 关闭后重新打开应用，key 与轮询频率会重新加载
- 清空配置后，界面状态、`settings.json` 与 Stronghold 中的 key 都被清理
