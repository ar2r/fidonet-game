/**
 * Random Event Scheduler
 * Checks for random events based on game state and probability
 */

import { MOM_PICKUP } from '../../events/types';

// Configuration
const EVENT_CONFIG = {
    MOM_PICKUP: {
        baseChance: 0.05, // 5% per action at night
        patienceModifier: 0.02, // +2% per missing patience point? No, -patience
    }
};

/**
 * Check and trigger random events
 * @param {Object} gameState - Current Redux state
 * @param {Function} dispatch - Redux dispatch
 * @param {Object} actions - Redux actions
 * @param {Function} appendOutput - Function to print to terminal
 */
export function checkRandomEvents(gameState, dispatch, actions, appendOutput) {
    const { phase } = gameState.gameState;
    const { connected } = gameState.network;
    const { atmosphere } = gameState.player.stats;

    // 1. Mom Pickup Event (Now "Scandal" or similar)
    // Condition: Connected AND Night
    if (connected && phase === 'night') {
        // Chance increases as atmosphere drops
        // 100 atmosphere -> 0% extra chance
        // 0 atmosphere -> 20% extra chance
        const patienceFactor = (100 - atmosphere) * 0.002;
        const chance = EVENT_CONFIG.MOM_PICKUP.baseChance + patienceFactor;

        if (Math.random() < chance) {
            triggerMomPickup(dispatch, actions, appendOutput);
            return; // Only one event per tick
        }
    }

    // 2. Line Noise (Future)
}

function triggerMomPickup(dispatch, actions, appendOutput) {
    appendOutput("");
    appendOutput("⚠️ ЩЕЛЧОК В ЛИНИИ...");
    appendOutput("Кто-то снял трубку в коридоре!");
    appendOutput("— Опять этот интернет! Спать мешаешь!");
    appendOutput("");
    appendOutput("NO CARRIER");
    
    dispatch(actions.disconnect());
    dispatch(actions.updateStat({ stat: 'sanity', value: -10 }));
    dispatch(actions.updateStat({ stat: 'atmosphere', value: -20 }));
}
