import { eventBus } from '../events/bus';
import { completeQuestAndProgress } from '../../engine/questEngine';
import { 
    MAIL_TOSSING_COMPLETED, 
    MESSAGE_READ, 
    MESSAGE_POSTED,
    ITEM_BOUGHT,
    FILE_SAVED,
    DOWNLOAD_COMPLETED,
    BBS_CONNECTED,
    MODEM_INITIALIZED
} from '../events/types';

/**
 * Setup global quest event listeners
 * @param {Function} dispatch - Redux dispatch
 * @param {Object} actions - Redux actions
 * @param {Function} getState - Redux getState
 * @returns {Function} cleanup function
 */
export function setupQuestListeners(dispatch, actions, getState) {
    const handlers = [];

    /**
     * Generic handler for event-based quests
     * @param {string} eventType 
     * @param {Object} payload 
     */
    const handleEvent = (eventType, payload) => {
        const state = getState();
        const activeQuestId = state.quests?.active;
        if (!activeQuestId) return;

        // Pass event to quest engine
        // Note: completeQuestAndProgress handles step verification internally
        // But currently it only takes questId, dispatch, actions.
        // It doesn't take event payload! 
        // We need to update completeQuestAndProgress or pass the check logic here.
        
        // Wait, completeQuestAndProgress marks the WHOLE quest as complete?
        // Or does it check steps?
        // The current implementation of completeQuestAndProgress (in questEngine.js)
        // just completes the quest without checking steps!
        // The checking logic was inside `commandParser` manually calling it.
        
        // Refactor: We need a `processEvent(event, payload)` function in questEngine
        // that checks if the event satisfies the current step of the active quest.
        
        // For now, let's implement the specific logic for new events here
        // until we refactor questEngine fully.
        
        if (eventType === MAIL_TOSSING_COMPLETED && activeQuestId === 'poll_boss') {
            completeQuestAndProgress('poll_boss', dispatch, actions);
        }
        
        if (eventType === MESSAGE_READ && activeQuestId === 'read_rules') {
            const { area, subj_contains } = payload;
            // Check metadata matches
            if (area === 'su_flame' && subj_contains && subj_contains.includes('Rules')) {
                completeQuestAndProgress('read_rules', dispatch, actions);
            }
        }

        if (eventType === MESSAGE_POSTED && activeQuestId === 'reply_welcome') {
             const { area } = payload;
             if (area === 'su_flame') {
                 completeQuestAndProgress('reply_welcome', dispatch, actions);
             }
        }

        if (eventType === ITEM_BOUGHT && activeQuestId === 'hardware_upgrade') {
            const { item } = payload;
            if (item === 'modem_28800') {
                completeQuestAndProgress('hardware_upgrade', dispatch, actions);
            }
        }
    };

    // Subscribe to all relevant events
    const events = [
        MAIL_TOSSING_COMPLETED,
        MESSAGE_READ,
        MESSAGE_POSTED,
        ITEM_BOUGHT,
        // Add others if we move logic from commandParser
    ];

    events.forEach(event => {
        const handler = (payload) => handleEvent(event, payload);
        const unsubscribe = eventBus.subscribe(event, handler);
        handlers.push(unsubscribe);
    });

    // Return cleanup
    return () => {
        handlers.forEach(unsubscribe => unsubscribe());
    };
}
