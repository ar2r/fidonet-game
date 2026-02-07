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
    const { momsPatience } = gameState.player.stats;

    // 1. Mom Pickup Event
    // Condition: Connected AND Night
    if (connected && phase === 'night') {
        // Chance increases as patience drops
        // 100 patience -> 0% extra chance
        // 0 patience -> 20% extra chance
        const patienceFactor = (100 - momsPatience) * 0.002;
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
    appendOutput("Мама сняла трубку в соседней комнате!");
    appendOutput("— Кому там не спится? А ну марш в кровать!");
    appendOutput("");
    appendOutput("NO CARRIER");
    
    dispatch(actions.disconnect());
    dispatch(actions.updateStat({ stat: 'sanity', value: -10 }));
    dispatch(actions.updateStat({ stat: 'momsPatience', value: -20 }));
}
