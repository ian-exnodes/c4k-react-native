# React Native Learning Project — Expo Setup

**Date:** 2026-05-25
**Project directory:** `d:\c4k-react-native`
**Status:** Approved by user, ready for implementation plan

## Goal

Scaffold a React Native learning/prototype project in `d:\c4k-react-native` using the Expo toolchain, runnable on a physical phone via the Expo Go app with hot reload.

## Scope

In scope:
- Local prerequisite checks (Node.js, npm, Git)
- Creating an Expo app with the TypeScript template
- Verifying the app starts and serves a QR code
- Confirming the app loads on a physical phone via Expo Go

Out of scope (deferred until needed by a real feature):
- iOS/Android native build tooling (Xcode, Android Studio)
- `expo prebuild` / custom native modules
- Backend / API / database integration
- Third-party state management (Redux, Zustand, etc.)
- Additional navigation libraries beyond Expo Router (default)
- App store publishing / EAS Build

## Prerequisites

On the Windows machine:
1. **Node.js LTS** (v20.x or v22.x) — provides `node` and `npm`.
2. **Git** — optional but recommended for version control of the project.
3. **VS Code** — already present.
4. **Expo Go app on the user's phone** — installed from Google Play (Android) or App Store (iOS).
5. **Same Wi-Fi network** between the development machine and the phone.

## Stack

| Concern | Choice | Reason |
|---|---|---|
| Toolchain | Expo (managed workflow) | No Xcode/Android Studio needed; fastest path for learning |
| Project scaffolder | `create-expo-app@latest` | Official Expo scaffold |
| Template | Default (TypeScript + Expo Router) | TypeScript catches errors early; Expo Router gives file-based routing out of the box |
| Run target during dev | Physical phone via Expo Go (QR scan) | Real-device feedback, zero emulator setup |
| Package manager | npm | Bundled with Node; no extra install |

## Setup Flow

1. Install Node.js LTS (if not already installed) — verify with `node --version` and `npm --version`.
2. Install Expo Go on the phone.
3. From `d:\c4k-react-native`, run `npx create-expo-app@latest .` to scaffold into the current (empty) directory using the default TypeScript template.
4. Start the dev server with `npx expo start`.
5. Scan the QR code with Expo Go on the phone.
6. Confirm hot reload works by editing a screen file and seeing the change on the phone.

## What the Scaffold Produces

- `app/` directory with example screens (file-based routing via Expo Router)
- `package.json`, `tsconfig.json`, `app.json` (Expo config)
- ESLint configuration
- Default assets (icons, splash screen placeholders)
- Working "tabs" example template

## Success Criteria

- `npx expo start` runs without error and displays a QR code.
- Scanning the QR code from Expo Go opens the app on the phone.
- Editing an example screen in `app/` reflects on the phone within a few seconds (hot reload).
- TypeScript files compile without errors.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Phone and PC on different networks (e.g., PC on Ethernet, phone on guest Wi-Fi) | Use `npx expo start --tunnel` as a fallback — routes through Expo's tunnel service |
| Windows firewall blocks Metro bundler port (8081) | Allow Node.js through Windows Defender Firewall when prompted on first run |
| Node version too old | Verify `node --version` is v20+ before scaffolding |

## Open Items for Implementation Plan

- Exact commands and verification steps per platform (Windows-specific paths)
- Order of operations: install prerequisites → scaffold → run → verify on phone
- Optional: initialize git repository inside the project
