/**
 * Game Loop Service
 * Orchestrates post-command effects: time advancement, random events, economy.
 * Extracted from commandParser.js to separate dispatch from orchestration.
 */

import { getTimeCost, computeTickEffects } from '../../engine/gameTick';
import { checkRandomEvents } from '../events/random/scheduler';
import { checkBills, checkDebtGameOver } from '../../engine/economy';
import { eventBus } from '../events/bus';
import { TIME_ADVANCED, PHASE_CHANGED, DAY_CHANGED } from '../events/types';

/**
 * Run all post-command game loop effects.
 * @param {string} command - The command that was just executed
 * @param {Object} gameState - Full Redux state snapshot
 * @param {Function} dispatch - Redux dispatch
 * @param {Object} actions - Redux action creators
 * @param {Function} appendOutput - Terminal output callback
 */
export function afterCommand(command, gameState, dispatch, actions, appendOutput) {
    // 1. Time advancement
    const cost = getTimeCost(command);
    const currentMinutes = gameState.gameState?.timeMinutes || 1380;
    const isConnected = gameState.network?.connected || false;

    const effects = computeTickEffects(currentMinutes, cost, isConnected);

    if (effects.newMinutes !== currentMinutes) {
        dispatch(actions.setTimeMinutes(effects.newMinutes));
        dispatch(actions.advanceTime(effects.newTimeString));

        if (effects.newPhase !== gameState.gameState.phase) {
            dispatch(actions.setPhase(effects.newPhase));
            eventBus.publish(PHASE_CHANGED, {
                oldPhase: gameState.gameState.phase,
                newPhase: effects.newPhase,
            });
        }

        if (effects.newZMH !== gameState.gameState.zmh) {
            dispatch(actions.setZMH(effects.newZMH));
        }

        if (effects.daysAdvanced > 0) {
            dispatch(actions.advanceDay(effects.daysAdvanced));
            eventBus.publish(DAY_CHANGED, {
                oldDay: gameState.gameState.day,
                newDay: gameState.gameState.day + effects.daysAdvanced,
            });
        }

        if (effects.atmosphereDelta !== 0) {
            dispatch(actions.updateStat({ stat: 'atmosphere', value: effects.atmosphereDelta }));
        }

        eventBus.publish(TIME_ADVANCED, {
            delta: cost,
            newTime: effects.newTimeString,
        });
    }

    // 2. Random events
    checkRandomEvents(gameState, dispatch, actions, appendOutput);

    // 3. Economy checks
    checkBills(gameState, dispatch, actions, appendOutput);
    checkDebtGameOver(gameState, dispatch, actions);
}
