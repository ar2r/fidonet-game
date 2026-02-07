/**
 * Quest Event Handlers
 * Subscribe to domain events and trigger quest progression
 */

import { eventBus } from '../events/bus';
import { FILE_SAVED, DOWNLOAD_COMPLETED, BBS_CONNECTED, MODEM_INITIALIZED } from '../events/types';
import { completeQuestAndProgress } from '../../engine/questEngine';

/**
 * Initialize quest event listeners
 * @param {Function} getState - Function to get current Redux state
 * @param {Function} dispatch - Redux dispatch
 * @param {Object} actions - Redux actions
 */
export function initializeQuestEventListeners(getState, dispatch, actions) {
    // Modem initialization
    eventBus.subscribe(MODEM_INITIALIZED, () => {
        const state = getState();
        if (state.quests.active === 'init_modem') {
            completeQuestAndProgress('init_modem', dispatch, actions);
        }
    });

    // BBS connection
    eventBus.subscribe(BBS_CONNECTED, (event) => {
        const state = getState();
        if (state.quests.active === 'first_connect' && event.bbs === 'The Nexus') {
            completeQuestAndProgress('first_connect', dispatch, actions);
        }
    });

    // Downloads
    eventBus.subscribe(DOWNLOAD_COMPLETED, (event) => {
        const state = getState();

        // Check if download_software quest is complete
        if (state.quests.active === 'download_software') {
            const hasT mail = state.player.inventory.includes('t-mail');
            const hasGolded = state.player.inventory.includes('golded');

            if (hasTmail && hasGolded) {
                completeQuestAndProgress('download_software', dispatch, actions);
            }
        }
    });

    // File saves (for config quests)
    eventBus.subscribe(FILE_SAVED, (event) => {
        const state = getState();

        // T-Mail config
        if (state.quests.active === 'configure_tmail' && event.path === 'C:\\FIDO\\T-MAIL.CTL') {
            if (event.valid) {
                completeQuestAndProgress('configure_tmail', dispatch, actions);
            }
        }

        // GoldED config
        if (state.quests.active === 'configure_golded' && event.path === 'C:\\FIDO\\GOLDED.CFG') {
            if (event.valid) {
                completeQuestAndProgress('configure_golded', dispatch, actions);
            }
        }
    });
}

/**
 * Check if an event should trigger quest progression
 * Pure function for testing
 * @param {string} questId - Active quest ID
 * @param {Object} event - Domain event
 * @param {Object} state - Game state
 * @returns {boolean}
 */
export function shouldProgressQuest(questId, event, state) {
    switch (questId) {
        case 'init_modem':
            return event.type === MODEM_INITIALIZED;

        case 'first_connect':
            return event.type === BBS_CONNECTED && event.bbs === 'The Nexus';

        case 'download_software':
            return event.type === DOWNLOAD_COMPLETED &&
                   state.player.inventory.includes('t-mail') &&
                   state.player.inventory.includes('golded');

        case 'configure_tmail':
            return event.type === FILE_SAVED &&
                   event.path === 'C:\\FIDO\\T-MAIL.CTL' &&
                   event.valid === true;

        case 'configure_golded':
            return event.type === FILE_SAVED &&
                   event.path === 'C:\\FIDO\\GOLDED.CFG' &&
                   event.valid === true;

        default:
            return false;
    }
}
