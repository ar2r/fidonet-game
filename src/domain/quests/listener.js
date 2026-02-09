import { eventBus } from '../events/bus';
import { completeQuestAndProgress } from './completion';
import { getQuestById } from '../../content/quests';
import { StepType } from './schema';

/**
 * Check if a step's metadata matches the event payload.
 * Steps with no metadata auto-match on event type alone.
 *
 * @param {Object} metadata - Step metadata from quest definition
 * @param {Object} payload - Event payload
 * @returns {boolean}
 */
export function matchesMetadata(metadata, payload) {
    if (!metadata || Object.keys(metadata).length === 0) {
        return true;
    }

    for (const [key, expected] of Object.entries(metadata)) {
        // Skip non-matching keys (e.g. 'validator' is for config validation, not event matching)
        if (key === 'validator') continue;

        if (key === 'subj_contains') {
            // Special: check if payload value contains the expected substring
            const payloadValue = payload[key] || payload.subject || '';
            if (!payloadValue.includes(expected)) return false;
        } else {
            // Exact match for all other keys
            if (payload[key] !== expected) return false;
        }
    }

    return true;
}

/**
 * Setup global quest event listeners.
 * Uses a generic algorithm that reads quest definitions from content/quests
 * instead of hardcoding quest IDs.
 *
 * @param {Function} dispatch - Redux dispatch
 * @param {Object} actions - Redux actions (completeQuest, setActiveQuest, updateSkill, setAct, completeStep)
 * @param {Function} getState - Redux getState
 * @returns {Function} cleanup function
 */
export function setupQuestListeners(dispatch, actions, getState) {
    // Wildcard subscribers receive a single event object: { type, timestamp, ...payload }
    const unsubscribe = eventBus.subscribe('*', (event) => {
        const eventType = event.type;
        const state = getState();
        const activeQuestId = state.quests?.active;
        if (!activeQuestId) return;

        const quest = getQuestById(activeQuestId);
        if (!quest || !quest.steps || quest.steps.length === 0) return;

        // Find EVENT steps matching this event type
        const eventSteps = quest.steps.filter(
            step => step.type === StepType.EVENT && step.event === eventType
        );

        if (eventSteps.length === 0) return;

        const completedStepIds = state.quests?.stepProgress?.[activeQuestId] || [];

        let newStepCompleted = false;

        for (const step of eventSteps) {
            // Skip already-completed steps
            if (completedStepIds.includes(step.id)) continue;

            if (matchesMetadata(step.metadata, event)) {
                dispatch(actions.completeStep({ questId: activeQuestId, stepId: step.id }));
                newStepCompleted = true;
            }
        }

        if (!newStepCompleted) return;

        // Check if ALL event-type steps are now completed
        const allEventSteps = quest.steps.filter(step => step.type === StepType.EVENT);
        const updatedCompleted = [...completedStepIds];
        // Include steps we just dispatched (they haven't reached Redux yet)
        for (const step of eventSteps) {
            if (matchesMetadata(step.metadata, event) && !updatedCompleted.includes(step.id)) {
                updatedCompleted.push(step.id);
            }
        }

        const allDone = allEventSteps.every(step => updatedCompleted.includes(step.id));

        if (allDone) {
            // Re-check state to avoid double-completion when command handlers
            // also call completeQuestAndProgress in the same synchronous flow
            const freshState = getState();
            if (freshState.quests?.active === activeQuestId) {
                completeQuestAndProgress(activeQuestId, dispatch, actions);
            }
        }
    });

    return unsubscribe;
}
