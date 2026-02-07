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
- **react-rnd** for draggable and resizable windows
- **styled-components** for component-level styling
- **Vitest** + **@testing-library/react** + **jsdom** for tests

## Architecture

### State Management (`src/engine/store.js`)
Single Redux store with five slices — all state lives here:
- **gameState**: day/night cycle, time, ZMH (Zone Mail Hour), virus state, game over
- **player**: name, stats (sanity, momsPatience, money), skills (typing, hardware), inventory, karma, rank
- **network**: connection status, current BBS, modem state, terminal mode, logs
- **quests**: active quest ID, completed quest list
- **windowManager**: open windows, positions, sizes, z-index, minimization state

Actions are exported directly from `store.js` (not separate slice files). Window manager actions are exported from `windowManager.js`.

### Window Management System (Redux + react-rnd)
Professional Windows 95-style window management with drag & drop, resize, minimize, and z-index control.

**Architecture:**
- **windowManager.js** (`src/engine/windowManager.js`): Redux slice managing all window state
  - State: `{ windows: {}, activeWindow: null, nextZIndex: 1 }`
  - Each window has: id, title, component, position, size, zIndex, isMinimized, isOpen
  - Actions: `openWindow`, `closeWindow`, `minimizeWindow`, `focusWindow`, `updateWindowPosition`, `updateWindowSize`, `updateWindowTitle`

**Components:**
- **DesktopWindow** (`src/components/DesktopWindow.jsx`): Wrapper for all windows
  - Uses `react-rnd` library for drag & drop and resize functionality
  - Renders react95 `Window` component inside `<Rnd>` container
  - Handlers: `onDragStop` → updateWindowPosition, `onResizeStop` → updateWindowSize
  - Bounds checking: `bounds="parent"` prevents windows from leaving screen
  - Z-index management: clicking window calls `focusWindow` action
  - Buttons: minimize ("_") and close ("X") in window header

- **TaskbarButton** (`src/components/TaskbarButton.jsx`): Taskbar buttons for open windows
  - Shows all open windows as buttons in taskbar
  - Active window is highlighted (`active={isActive}`)
  - Click restores minimized windows or focuses inactive windows

**Window Registration Pattern:**
```javascript
// Define windows in WINDOW_DEFINITIONS (App.jsx)
const WINDOW_DEFINITIONS = {
  terminal: {
    id: 'terminal',
    title: 'MS-DOS Prompt - C:\\',
    component: 'terminal',
    position: { x: 100, y: 100 },
    size: { width: 640, height: 480 },
  },
  // ... more windows
};

// Open window via dispatch
dispatch(openWindow(WINDOW_DEFINITIONS.terminal));

// Render all windows
{Object.values(windows).map(window => (
  <DesktopWindow key={window.id} windowId={window.id}>
    {renderWindowContent(window.id, window.component)}
  </DesktopWindow>
))}
```

**Window Components (embedded mode):**
- Window components (TerminalWindow, ConfigEditor, GoldEDConfig, QuestJournal) render content only
- They do NOT render react95 `<Window>` wrapper themselves
- DesktopWindow provides the wrapper with drag/resize/minimize/close functionality
- TerminalWindow has `embedded` prop for backwards compatibility (renders Window if `embedded={false}`)

**Key Features:**
- ✅ Drag windows by header (`dragHandleClassName="window-header"`)
- ✅ Resize windows by corners/edges (`minWidth={320}`, `minHeight={240}`)
- ✅ Minimize windows (stored in Redux, hidden from DOM)
- ✅ Restore via taskbar buttons
- ✅ Z-index automatically managed (clicking window brings to front)
- ✅ Multiple windows can be open simultaneously
- ✅ Terminal opens automatically on app load

### Game Engine (`src/engine/`)
- **commandParser.js**: Processes terminal commands (AT modem commands, `DIAL`, `CLS`, `HELP`, `HINT`). Receives full Redux state + dispatch + action creators + an `appendOutput` callback. Uses `setTimeout` chains for simulating modem connection delays. Supports multiple terminal modes via `network.terminalMode` (IDLE, BBS_MENU, BBS_FILES, BBS_CHAT). Publishes events via EventBus.
- **fileSystem.js**: In-memory DOS file system simulation (`C:\FIDO`, `C:\GAMES`, config files). `FileSystem` class with `ls()`, `cd()`, `cat()`, `pwd()`, `createDir()`, `writeFile()`. Singleton instance exported from `fileSystemInstance.js`.
- **fileSystemInstance.js**: Singleton instance of FileSystem, shared across commandParser and other modules.
- **windowManager.js**: Redux slice for window management (see Window Management System above).
- **gameTick.js**: Time advancement system. Each command has a time cost. Manages day/night cycle and ZMH (Zone Mail Hour 04:00-05:00).
- **questEngine.js**: Quest completion and progression logic. `completeQuestAndProgress()` handles quest completion, rewards (skills, items, stats), and activates next quest. Checks prerequisites and publishes events.
- **configValidator.js**: FidoNet address validation and config file generation. Validates address format (Z:NNNN/NNN.PP), generates T-Mail config files.
- **events.js**: Random event system (e.g., virus "Kurochka Ryaba"). Events have chance-based triggers checked against game state.

### Domain Layer (Event-Driven Architecture)
Separation of concerns: content → domain → features/UI. Domain layer contains business logic, independent of UI.

**Event Bus** (`src/domain/events/`):
- **bus.js**: Pub-sub event bus for decoupled communication between modules
- **types.js**: 15+ event types (COMMAND_EXECUTED, BBS_CONNECTED, DOWNLOAD_COMPLETED, FILE_SAVED, MODEM_INITIALIZED, QUEST_COMPLETED, etc.)
- Supports wildcard subscribers (`*` pattern), multiple subscriptions, error handling
- Usage: `eventBus.publish(EVENT_TYPE, payload)` and `eventBus.subscribe(EVENT_TYPE, callback)`

**Quest System** (`src/domain/quests/` + `src/content/quests/`):
- **schema.js**: Quest validation schema with strict checks (unique IDs, valid references, no circular dependencies)
- **validators.js**: Domain validators (tmail.valid, golded.valid, file.exists, inventory.has) for quest step validation
- **service.js**: Quest completion business logic (handleTMailConfigComplete, handleGoldEDConfigComplete)
- **eventHandlers.js**: Quest event listeners (MODEM_INITIALIZED, DOWNLOAD_COMPLETED, FILE_SAVED)
- **content/quests/**: Declarative quest definitions by act (act1.js, act2.js)
  - Quest structure: id, act, title, description, hint, steps[], rewards[], nextQuest, prerequisites[]
  - Step types: EVENT (wait for event), COMMAND (execute command), CONDITION (check state), MANUAL (player action)
  - Reward types: SKILL (+delta to skill), ITEM (add to inventory), STAT (modify stat), MONEY (add money)
- Auto-validation on load (fail-fast in development mode)

**Command Registry** (`src/domain/command/`):
- **registry.js**: CommandRegistry class for extensible command handling by terminal mode
- **types.js**: TerminalMode enum (IDLE, BBS_MENU, BBS_FILES, BBS_CHAT), CommandContext, CommandResult types
- **handlers/**: Command handlers by mode (idle.js, bbsMenu.js, bbsFiles.js, bbsChat.js)
- Supports exact match, startsWith, regex patterns
- Global handlers work in any mode (CLS, HELP)
- Pattern: `register(mode, pattern, handler)` → `execute(mode, command, context)`

### UI Layer (`src/components/`)
- **TerminalWindow.jsx**: Main gameplay component — green-on-black DOS terminal. Captures keyboard input globally (`window.addEventListener('keydown')`), maintains history as a string array, renders a blinking cursor. Delegates command processing to `commandParser.js`. Supports `embedded={true}` prop to render content without Window wrapper (used inside DesktopWindow).
- **DesktopWindow.jsx**: Universal window wrapper with drag/drop and resize via react-rnd (see Window Management System above).
- **TaskbarButton.jsx**: Taskbar button for each open window (see Window Management System above).
- **TUI/ConfigEditor.jsx**: T-Mail configuration editor (DOS blue TUI style). Renders content only, no Window wrapper.
- **TUI/GoldEDConfig.jsx**: GoldED configuration editor (DOS blue TUI style). Renders content only, no Window wrapper.
- **TUI/GoldED.jsx**: DOS-blue TUI interface mimicking the GoldED echomail editor (placeholder).
- **features/quests/QuestJournal.jsx**: Norton Commander-styled quest journal. Renders content only, no Window wrapper.

### App Structure (`src/App.jsx`)
Windows 95 desktop with:
- Desktop icons that unlock based on player inventory (e.g., `t-mail` and `golded` appear after acquisition)
- Window management via Redux (`windowManager` slice) — multiple windows can be open simultaneously
- `WINDOW_DEFINITIONS` object defines all available windows with their properties (id, title, component, position, size)
- Start menu (Пуск) and taskbar with clock
- Taskbar shows buttons for all open windows (via TaskbarButton components)
- Terminal window opens automatically on app load (`useEffect` with `openWindow` dispatch)
- Double-click on desktop icons calls `dispatch(openWindow(WINDOW_DEFINITIONS[windowId]))`

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
