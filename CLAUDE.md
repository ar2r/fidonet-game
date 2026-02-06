# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FidoNet 1995 Simulator — a text-based puzzle/simulator/RPG game set in 1995 post-Soviet Russia. The player progresses from a "Lamer" to a SysOp/Coordinator by operating a BBS node, configuring modem software, navigating FidoNet echomail, and surviving flame wars. The UI mimics a Windows 95 desktop with retro TUI (DOS terminal, GoldED, Norton Commander) aesthetics.

The game is written in Russian. All in-game text, UI labels, and narrative content should be in Russian.

## Commands

- `npm run dev` — Start dev server (port 5175)
- `npm run build` — Production build (Vite)
- `npm run lint` — ESLint
- `npm run test` — Run tests with Vitest
- `npx vitest run src/App.test.jsx` — Run a single test file

## Tech Stack

- **React 19** + **Vite 7** (JSX, no TypeScript)
- **Redux Toolkit** (`@reduxjs/toolkit` + `react-redux`) for state management
- **react95** for Windows 95-styled UI components (Window, WindowHeader, Button, AppBar, etc.)
- **styled-components** for component-level styling
- **Vitest** + **@testing-library/react** + **jsdom** for tests

## Architecture

### State Management (`src/engine/store.js`)
Single Redux store with four slices — all state lives here:
- **gameState**: day/night cycle, time, ZMH (Zone Mail Hour)
- **player**: name, stats (sanity, momsPatience, money), skills (typing, hardware), inventory, karma, rank
- **network**: connection status, current BBS, modem state, logs
- **quests**: active quest ID, completed quest list

Actions are exported directly from `store.js` (not separate slice files).

### Game Engine (`src/engine/`)
- **commandParser.js**: Processes terminal commands (AT modem commands, `DIAL`, `CLS`, `HELP`). Receives full Redux state + dispatch + action creators + an `appendOutput` callback. Uses `setTimeout` chains for simulating modem connection delays.
- **fileSystem.js**: In-memory DOS file system simulation (`C:\FIDO`, `C:\GAMES`, config files). `FileSystem` class with basic `ls()` — path resolution is mostly placeholder/TODO.
- **events.js**: Random event system (e.g., virus "Kurochka Ryaba"). Events have chance-based triggers checked against game state.
- **quests.js**: Quest definitions (currently only "get_online" / First Contact).

### UI Layer (`src/components/`)
- **TerminalWindow.jsx**: Main gameplay component — green-on-black DOS terminal. Captures keyboard input globally (`window.addEventListener('keydown')`), maintains history as a string array, renders a blinking cursor. Delegates command processing to `commandParser.js`.
- **TextFileViewer.jsx**: Reusable react95 Window wrapper for displaying text file content.
- **TUI/GoldED.jsx**: DOS-blue TUI interface mimicking the GoldED echomail editor (placeholder).

### App Structure (`src/App.jsx`)
Windows 95 desktop with:
- Desktop icons that unlock based on player inventory (e.g., `t-mail` and `golded` appear after acquisition)
- Single active window state (`terminal`, `readme`, `t-mail`, `golded`)
- Start menu (Пуск) and taskbar with clock

### Visual Assets
- `src/assets/ascii.js`: ASCII art banners (FidoNet logo, modem connect, BBS menu)
- `src/assets/text.js`: Game manual text
- `src/index.css`: CRT scanline/flicker effects, VGA color palette CSS variables (`--vga-*`), terminal theme variants (green, blue/Norton, amber)

## Game Design Reference

Detailed design documents are in `docs/roadmap/`:
- `game_design.md` — master design doc (4 acts: Connect → Setup → Mail → Upgrade)
- `mechanics.md` — skill/progression system, controls, quest mechanics
- `economy.md`, `quests.md`, `scenarios.md` — supporting design docs

## ESLint

Uses flat config (`eslint.config.js`). Notable rule: `no-unused-vars` ignores variables starting with uppercase or underscore (`varsIgnorePattern: '^[A-Z_]'`).

## Testing

Vitest config is in `vite.config.js` (not a separate file). Uses jsdom environment with `src/setupTests.js` that polyfills `scrollIntoView` and imports `@testing-library/jest-dom`. Globals are enabled (no need to import `describe`/`it`/`expect`).
