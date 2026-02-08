# Codebase Audit Report

**Date:** 2026-02-08
**Project:** FidoNet Simulator 1995
**Auditor:** Antigravity AI

## 1. Executive Summary

The project is approximately 70% through a transition from a monolithic procedural architecture to a modular, event-driven Domain-Driven Design (DDD). The core gameplay loops (Acts 1-6) are functional, and the UI is robust. However, a "Hybrid" state exists where logic is split between the legacy `src/engine` and the new `src/domain` layers.

## 2. Architecture Analysis

### 2.1. Hybrid State (Engine vs. Domain)
*   **Current State:**
    *   **`src/engine`**: Contains the "legacy" core. `questEngine.js`, `economy.js`, and `store.js` reside here. These files mix state mutation (Redux dispatch) with business logic.
    *   **`src/domain`**: The target architecture. Contains `command/registry.js`, `events/bus.js`, and `quests/listener.js`. This layer focuses on clean, event-driven interactions.
*   **Observation:** There is duplication and unclear ownership. For example, `questEngine.js` is the *executor* of quest completions, but `domain/quests/listener.js` is the *trigger*.
*   **Recommendation:** Continue migrating logic from `engine` to `domain`. `engine` should eventually only contain the Redux store and perhaps the main game tick loop.

### 2.2. Command Processing
*   **Status:** **Good Progress**.
*   **Analysis:** The monolithic `commandParser.js` switch statement has been largely replaced by `CommandRegistry` and individual handlers in `domain/command/handlers`.
*   **Issue:** `src/engine/commandParser.js` still exists as a procedural entry point (`processCommand`). It handles initial checks and context passing.
*   **Recommendation:** Refactor `processCommand` into a `CommandService` in the domain layer that dispatches events (e.g., `COMMAND_RECEIVED`) rather than directly calling handlers.

### 2.3. Quest System
*   **Status:** **Functional but Split**.
*   **Analysis:**
    *   Quest Data: `src/content/quests/` (Clean, declarative).
    *   Quest Execution: `src/engine/questEngine.js` (Handles state updates, rewards).
    *   Quest Triggers: `src/domain/quests/listener.js` (Listens to EventBus).
*   **Critique:** `listener.js` contains a long chain of hardcoded `if (event === X && quest === Y)` statements. This is brittle.
*   **Recommendation:** Move quest completion criteria *into* the quest schema itself (e.g., `completionTrigger: { event: 'MESSAGE_READ', criteria: { ... } }`). The listener should then be generic.

### 2.4. State Management
*   **Status:** **Centralized (Redux)**.
*   **Analysis:** `src/engine/store.js` uses Redux Toolkit efficiently.
*   **Issue:** `store.js` is a "God File" containing all slices (`gameState`, `player`, `network`, `quests`).
*   **Recommendation:** Split slices into separate files (e.g., `src/domain/state/slices/playerSlice.js`) for better maintainability.

## 3. Technical Debt & Cleanup

### 3.1. Legacy Files to Delete
The following files appear to be obsolete or superseded:
*   `src/engine/quests.js` (Superseded by `src/content/quests` and `questEngine.js`)
*   `src/engine/events.js` (Superseded by `src/domain/events/bus.js`)

### 3.2. Code Quality Issues
*   **UI/Logic Coupling:** `TerminalWindow.jsx` directly imports `processCommand` and Redux actions. Ideally, it should just dispatch a `USER_INPUT` event.
*   **Hardcoded Logic:** `src/domain/quests/listener.js` hardcodes quest IDs (`poll_boss`, `read_rules`). Renaming a quest ID would break the logic in multiple places.

## 4. Feature Gaps

*   **Quest Journal:** `src/features/quests/QuestJournal.jsx` has a TODO for tracking individual step progress. Currently, it acts as binary (active/complete).
*   **Reward Handling:** `questEngine.js` successfully handles `item`, `skill`, `stat`, and `money` rewards, covering previous gaps.

## 5. Action Plan

1.  **Immediate Cleanup:** Delete `src/engine/quests.js` and `src/engine/events.js`.
2.  **Refactor Store:** Split `store.js` into multiple slice files.
3.  **Generalize Quests:** Refactor `listener.js` to read completion criteria from the quest objects instead of hardcoding checks.
4.  **UI Decoupling:** Introduce a custom hook `useTerminal` for `TerminalWindow` to abstract away the command processing logic.

## 6. Deep Dive: Quest System Architecture

### 6.1. Current Status
*   **Data Definition:** **Excellent**. Quests in `src/content/quests/` use a declarative schema (`StepType.EVENT`, `metadata`) that fully describes *what* is needed to complete them.
*   **Execution Logic:** **Poor**. `src/domain/quests/listener.js` ignores this declarative schema and uses hardcoded `if/else` blocks for specific quest IDs.
    *   *Violation:* Open/Closed Principle. Adding a new quest requires modifying the listener code.
*   **State Management:** **Incomplete**. The Redux store (`src/engine/store.js`) tracks the *active quest* but does not track *completed steps* within that quest. `QuestJournal.jsx` currently mocks this data.

### 6.2. Proposed Refactoring
To fix the "Hybrid State" and minimize errors when changing quests:

1.  **Update Store:**
    *   Modify `questSlice` to track progress:
        ```javascript
        state.stepProgress = {
            'quest_id': ['step_id_1', 'step_id_2'] // List of completed steps
        }
        ```
2.  **Generic Event Listener:**
    *   Rewrite `listener.js` to be agnostic of specific quest IDs.
    *   **Algorithm:**
        1.  On Event `E` with payload `P`.
        2.  Get `activeQuest`.
        3.  Find steps in `activeQuest` where `step.event === E`.
        4.  Match `step.metadata` against `P` (e.g., `step.item === payload.item`).
        5.  If match: dispatch `completeStep(stepId)`.
        6.  If all steps completed: dispatch `completeQuest()`.
3.  **Benefits:**
    *   **Zero Code Changes for New Quests:** Just add a JSON object to `src/content/quests/`.
    *   **Visual Feedback:** The `QuestJournal` can finally show real checkboxes for steps.
