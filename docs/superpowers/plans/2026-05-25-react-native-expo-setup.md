# React Native Expo Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a working Expo + TypeScript React Native app in `d:\c4k-react-native`, verify the dev server runs, and confirm the app loads on a physical phone via Expo Go with hot reload.

**Architecture:** Use Expo's managed workflow via `create-expo-app` with the default TypeScript + Expo Router template. Dev loop is `npx expo start` → QR code → Expo Go on phone. No native build tooling required.

**Tech Stack:** Node.js LTS (v20+), npm, Expo SDK (latest), Expo Router, TypeScript, Expo Go (phone app).

**Spec:** [2026-05-25-react-native-expo-setup-design.md](../specs/2026-05-25-react-native-expo-setup-design.md)

**Platform note:** All shell commands are PowerShell. The project lives at `d:\c4k-react-native`. Run commands from that directory unless stated otherwise.

---

## Task 1: Verify Node.js prerequisite

**Files:** none (environment check only)

- [ ] **Step 1: Check Node.js version**

Run: `node --version`
Expected: `v20.x.x` or `v22.x.x` (any v20+ LTS is fine).

If the command is not found or version is < 20:
1. Download Node.js LTS installer from https://nodejs.org
2. Run the installer with defaults
3. Open a NEW PowerShell window (PATH refresh) and re-run `node --version`

- [ ] **Step 2: Check npm version**

Run: `npm --version`
Expected: `10.x.x` or higher (bundled with Node 20+).

- [ ] **Step 3: Check npx is available**

Run: `npx --version`
Expected: `10.x.x` or higher.

---

## Task 2: Install Expo Go on the phone

**Files:** none (phone setup)

- [ ] **Step 1: Install Expo Go**

On the phone:
- **Android:** Open Google Play Store, search "Expo Go", install.
- **iOS:** Open App Store, search "Expo Go", install.

- [ ] **Step 2: Open Expo Go once**

Launch the app to ensure it initializes correctly. No account is required to scan a QR code from a local dev server.

- [ ] **Step 3: Confirm phone and PC are on the same Wi-Fi**

On the phone: Settings → Wi-Fi → note the network name.
On the PC: click the Wi-Fi icon in the system tray → confirm same network name.

If the PC is on Ethernet only or different network, the fallback (`--tunnel`) is covered in Task 5.

---

## Task 3: Scaffold the Expo project

**Files:**
- Create: entire `d:\c4k-react-native` project tree (package.json, app/, etc.)

- [ ] **Step 1: Confirm the directory is empty**

Run from `d:\c4k-react-native`:
```powershell
Get-ChildItem -Force | Where-Object { $_.Name -ne 'docs' }
```
Expected: no output (only the `docs/` folder we created for the spec/plan exists).

If other files exist, stop and investigate — do NOT proceed.

- [ ] **Step 2: Run the Expo scaffolder into the current directory**

Run from `d:\c4k-react-native`:
```powershell
npx create-expo-app@latest .
```

The `.` means "scaffold into the current directory" instead of creating a new subfolder.

Expected:
- Prompt may ask to confirm overwriting / using current directory — answer yes.
- It downloads the default template (TypeScript + Expo Router with tabs example).
- Installs dependencies via npm.
- Takes 1–3 minutes depending on network.
- Ends with a "✅ Your project is ready!" message.

- [ ] **Step 3: Verify the scaffold succeeded**

Run:
```powershell
Test-Path package.json; Test-Path app; Test-Path tsconfig.json
```
Expected: three `True` lines.

- [ ] **Step 4: Inspect what was created**

Run:
```powershell
Get-ChildItem
```
Expected to see at minimum: `app/`, `assets/`, `components/`, `constants/`, `hooks/`, `scripts/`, `node_modules/`, `app.json`, `package.json`, `tsconfig.json`, `docs/` (our pre-existing folder).

---

## Task 4: Initialize git (optional but recommended)

**Files:**
- Create: `.git/` (via `git init`)
- Verify: `.gitignore` (already created by Expo scaffolder)

- [ ] **Step 1: Check git is installed**

Run: `git --version`
Expected: `git version 2.x.x`. If not installed, download from https://git-scm.com and re-open PowerShell.

- [ ] **Step 2: Confirm Expo created a .gitignore**

Run:
```powershell
Test-Path .gitignore
```
Expected: `True`. The Expo scaffolder includes a `.gitignore` that excludes `node_modules/`, `.expo/`, etc.

- [ ] **Step 3: Initialize repo and make first commit**

Run:
```powershell
git init
git add .
git commit -m "chore: initial Expo TypeScript scaffold"
```

Expected: commit created with the scaffolded files (node_modules excluded by .gitignore).

---

## Task 5: Start the dev server and verify on the phone

**Files:** none (runtime verification)

- [ ] **Step 1: Start Expo dev server**

Run from `d:\c4k-react-native`:
```powershell
npx expo start
```

Expected output includes:
- A large QR code in the terminal
- A line like `› Metro waiting on exp://192.168.x.x:8081`
- Keybinding hints: `a` (Android), `i` (iOS), `w` (web), `r` (reload), `j` (debugger)

If Windows Defender Firewall prompts to allow Node.js network access, click **Allow access** for Private networks.

- [ ] **Step 2: Scan the QR code from the phone**

- **Android:** Open Expo Go → tap "Scan QR code" → point at the terminal QR.
- **iOS:** Open the built-in Camera app → point at the QR → tap the "Open in Expo Go" banner.

Expected: Expo Go opens, shows a "Building JavaScript bundle" progress bar, then the example tabs app appears on the phone.

- [ ] **Step 3: Fallback if the phone cannot connect**

If the phone shows "Could not connect to development server":
1. In the terminal where `expo start` is running, press `Ctrl+C` to stop it.
2. Restart with tunnel mode:
   ```powershell
   npx expo start --tunnel
   ```
3. First run installs `@expo/ngrok` — accept the prompt.
4. Re-scan the new QR code.

Tunnel mode routes through Expo's servers, so it works across networks but is slower.

- [ ] **Step 4: Verify hot reload works**

With the app running on the phone and `expo start` still running:

1. Open `app/(tabs)/index.tsx` in VS Code.
2. Find the visible "Welcome!" text (or similar heading from the template).
3. Change it to "Hello React Native!" and save.

Expected: within 1–3 seconds the phone screen updates to show the new text — without you touching the phone.

- [ ] **Step 5: Stop the dev server**

In the terminal, press `Ctrl+C` (then `Y` if prompted to terminate the batch job).

- [ ] **Step 6: Commit the hot-reload edit (if git was initialized)**

Run:
```powershell
git add "app/(tabs)/index.tsx"
git commit -m "chore: verify hot reload with welcome text change"
```

---

## Task 6: Verify TypeScript compiles cleanly

**Files:** none (verification)

- [ ] **Step 1: Run the TypeScript compiler in no-emit mode**

Run from `d:\c4k-react-native`:
```powershell
npx tsc --noEmit
```

Expected: no output (success — TypeScript found no errors).

If errors appear, they likely come from the edit in Task 5 Step 4. Fix the syntax in `app/(tabs)/index.tsx` and re-run.

---

## Task 7: Final smoke test

**Files:** none

- [ ] **Step 1: Stop any running dev server, then start fresh**

Run:
```powershell
npx expo start
```

- [ ] **Step 2: Re-scan QR code from phone**

Confirm the app loads on the phone again. This catches any state-dependent issues from leftover caches.

- [ ] **Step 3: Confirm success criteria from spec**

Check each one:
- [ ] `npx expo start` runs without error and shows a QR code
- [ ] Phone loads the app via Expo Go
- [ ] Hot reload works (edit a file, see change on phone)
- [ ] `npx tsc --noEmit` reports no errors

- [ ] **Step 4: Stop dev server**

Press `Ctrl+C`.

- [ ] **Step 5: Final commit (if git was initialized)**

Run:
```powershell
git status
```

If there are uncommitted changes, commit them:
```powershell
git add .
git commit -m "chore: complete Expo setup and verification"
```

---

## Done

The project is now:
- Scaffolded with Expo + TypeScript + Expo Router
- Verified runnable on a physical phone via Expo Go
- Verified to hot-reload edits
- TypeScript-clean
- (Optionally) under git version control

Next learning steps (out of scope here, suggest separately):
- Read the generated `app/(tabs)/_layout.tsx` to understand file-based routing
- Add a new screen by creating a new file under `app/`
- Explore the Expo docs at https://docs.expo.dev
