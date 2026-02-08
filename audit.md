# Codebase Audit Report

**Date:** 2026-02-08
**Project:** FidoNet Simulator 1995
**Auditor:** Antigravity AI
**Status:** Architecture Transition (Stage 2)

## 1. Executive Summary

The project has made significant progress in transitioning to a modular, event-driven architecture. The "Action Plan" from the previous audit has been **completed**:
*   Legacy files (`src/engine/quests.js`, `src/engine/events.js`) have been deleted.
*   Redux store (`src/engine/store.js`) has been refactored into modular slices.
*   Quest system (`src/domain/quests/listener.js`) is now generic and data-driven, removing hardcoded checks.
*   UI (`TerminalWindow.jsx`) is decoupled via the `useTerminal` hook.
*   Quest Journal now tracks and displays individual step progress.

The remaining work focuses on eliminating the last remnants of the "Hybrid State" by moving the remaining logic from `src/engine` to `src/domain`.

## 2. Architecture Analysis

### 2.1. Hybrid State (Engine vs. Domain)
*   **Current State:**
    *   **`src/engine`**: Still contains `commandParser.js` (entry point), `questEngine.js` (executor), `economy.js`, and `gameTick.js`.
    *   **`src/domain`**: Now contains the `CommandRegistry`, generic `listener.js`, and event bus.
*   **Action:** Continue migrating logic. The `processCommand` function in `src/engine/commandParser.js` currently orchestrates time, random events, and economy. This orchestration should move to a `GameLoopService` or `CommandService` in the domain.

### 2.2. Command Processing
*   **Status:** **Advanced**.
*   **Analysis:** Commands are registered and handled via `CommandRegistry`.
*   **Remaining Issue:** `src/engine/commandParser.js` is still the imperative entry point. It manually calls `getTimeCost`, `computeTickEffects`, `checkRandomEvents`, etc.
*   **Recommendation:** Refactor `processCommand` into a proper domain service (e.g., `src/domain/game/GameService.js` or `CommandExecutionService`) that emits events for time passing, allowing other systems to react, rather than hardcoding function calls.

### 2.3. Quest System
*   **Status:** **Excellent (Generic Implementation Complete)**.
*   **Analysis:** `src/domain/quests/listener.js` now uses a generic matching algorithm against quest metadata. `QuestJournal` correctly renders step progress from Redux.
*   **Next Step:** Ensure all quests in `src/content/quests/` have correct metadata for the new generic listener (e.g., `subj_contains` usage).

## 3. Pending Technical Debt

### 3.1. Engine Cleanup
The following files in `src/engine` should be evaluated for migration to `src/domain`:
*   `commandParser.js` -> `domain/command/execution.js`
*   `questEngine.js` -> `domain/quests/service.js` (renaming/moving)
*   `economy.js` -> `domain/economy/service.js`
*   `gameTick.js` -> `domain/time/service.js`

## 4. Action Plan (Next Steps)

1.  **Refactor `commandParser.js`**: Move the command processing and game loop orchestration (time, events, economy checks) out of `src/engine` into a domain service.
2.  **Migrate `questEngine.js`**: Move the quest completion logic (rewards, state updates) to `src/domain/quests`.
3.  **Verify Quest Data**: Audit `src/content/quests/*.js` to ensure all quests obey the new metadata schema required by the generic listener.