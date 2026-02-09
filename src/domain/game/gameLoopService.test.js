import { describe, it, expect, vi, beforeEach } from 'vitest';
import { afterCommand } from './gameLoopService';
import { eventBus } from '../events/bus';
import { TIME_ADVANCED, PHASE_CHANGED, DAY_CHANGED } from '../events/types';

function makeActions() {
    return {
        setTimeMinutes: vi.fn(v => ({ type: 'setTimeMinutes', payload: v })),
        advanceTime: vi.fn(v => ({ type: 'advanceTime', payload: v })),
        setPhase: vi.fn(v => ({ type: 'setPhase', payload: v })),
        setZMH: vi.fn(v => ({ type: 'setZMH', payload: v })),
        advanceDay: vi.fn(v => ({ type: 'advanceDay', payload: v })),
        updateStat: vi.fn(v => ({ type: 'updateStat', payload: v })),
        setGameOver: vi.fn(v => ({ type: 'setGameOver', payload: v })),
        disconnect: vi.fn(() => ({ type: 'disconnect' })),
        setLastBillDay: vi.fn(v => ({ type: 'setLastBillDay', payload: v })),
        payBill: vi.fn(v => ({ type: 'payBill', payload: v })),
    };
}

function makeState(overrides = {}) {
    return {
        gameState: {
            timeMinutes: 720, // 12:00 noon
            phase: 'day',
            zmh: false,
            day: 1,
            ...overrides.gameState,
        },
        network: {
            connected: false,
            terminalMode: 'IDLE',
            ...overrides.network,
        },
        player: {
            stats: { atmosphere: 100, sanity: 100, debt: 0 },
            lastBillDay: 0,
            ...overrides.player,
        },
        quests: { activeQuestId: null, completed: [], ...overrides.quests },
    };
}

describe('gameLoopService', () => {
    let dispatch;
    let actions;
    let appendOutput;

    beforeEach(() => {
        dispatch = vi.fn();
        actions = makeActions();
        appendOutput = vi.fn();
        eventBus.clear();
    });

    describe('time advancement', () => {
        it('advances time for commands with cost', () => {
            const state = makeState();
            afterCommand('DIR', state, dispatch, actions, appendOutput);

            // DIR costs 1 minute, 720 → 721
            expect(actions.setTimeMinutes).toHaveBeenCalledWith(721);
            expect(actions.advanceTime).toHaveBeenCalledWith('12:01');
        });

        it('does not advance time for zero-cost commands', () => {
            const state = makeState();
            afterCommand('CLS', state, dispatch, actions, appendOutput);

            expect(actions.setTimeMinutes).not.toHaveBeenCalled();
            expect(actions.advanceTime).not.toHaveBeenCalled();
        });

        it('publishes TIME_ADVANCED event', () => {
            const state = makeState();
            const handler = vi.fn();
            eventBus.subscribe(TIME_ADVANCED, handler);

            afterCommand('DIR', state, dispatch, actions, appendOutput);

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({ type: TIME_ADVANCED, delta: 1, newTime: '12:01' })
            );
        });
    });

    describe('phase changes', () => {
        it('detects night→day transition', () => {
            // 05:59 + 1 minute = 06:00 → day
            const state = makeState({ gameState: { timeMinutes: 359, phase: 'night', zmh: false, day: 1 } });
            afterCommand('DIR', state, dispatch, actions, appendOutput);

            expect(actions.setPhase).toHaveBeenCalledWith('day');
        });

        it('publishes PHASE_CHANGED event on transition', () => {
            const state = makeState({ gameState: { timeMinutes: 359, phase: 'night', zmh: false, day: 1 } });
            const handler = vi.fn();
            eventBus.subscribe(PHASE_CHANGED, handler);

            afterCommand('DIR', state, dispatch, actions, appendOutput);

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({ type: PHASE_CHANGED, oldPhase: 'night', newPhase: 'day' })
            );
        });

        it('does not publish PHASE_CHANGED when phase stays the same', () => {
            const state = makeState(); // noon, phase=day
            const handler = vi.fn();
            eventBus.subscribe(PHASE_CHANGED, handler);

            afterCommand('DIR', state, dispatch, actions, appendOutput);

            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('day changes', () => {
        it('detects day change when crossing midnight', () => {
            // 23:55 + 5 minutes (DIAL) = 24:00 → next day
            const state = makeState({ gameState: { timeMinutes: 1435, phase: 'night', zmh: false, day: 3 } });
            afterCommand('DIAL 5553389', state, dispatch, actions, appendOutput);

            expect(actions.advanceDay).toHaveBeenCalledWith(1);
        });

        it('publishes DAY_CHANGED event', () => {
            const state = makeState({ gameState: { timeMinutes: 1435, phase: 'night', zmh: false, day: 3 } });
            const handler = vi.fn();
            eventBus.subscribe(DAY_CHANGED, handler);

            afterCommand('DIAL 5553389', state, dispatch, actions, appendOutput);

            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({ type: DAY_CHANGED, oldDay: 3, newDay: 4 })
            );
        });
    });

    describe('atmosphere', () => {
        it('decreases atmosphere when connected at night', () => {
            const state = makeState({
                gameState: { timeMinutes: 1380, phase: 'night', zmh: false, day: 1 },
                network: { connected: true, terminalMode: 'IDLE' },
            });
            afterCommand('DIR', state, dispatch, actions, appendOutput);

            expect(actions.updateStat).toHaveBeenCalledWith({ stat: 'atmosphere', value: -1 });
        });

        it('does not decrease atmosphere during day', () => {
            const state = makeState({
                network: { connected: true, terminalMode: 'IDLE' },
            });
            afterCommand('DIR', state, dispatch, actions, appendOutput);

            // updateStat should NOT be called with atmosphere
            const atmosphereCalls = actions.updateStat.mock.calls.filter(
                call => call[0].stat === 'atmosphere'
            );
            expect(atmosphereCalls).toHaveLength(0);
        });
    });

    describe('economy', () => {
        it('triggers bill on day 7', () => {
            const state = makeState({
                gameState: { timeMinutes: 720, phase: 'day', zmh: false, day: 7 },
                player: { stats: { atmosphere: 100, sanity: 100, debt: 0 }, lastBillDay: 0 },
            });
            afterCommand('DIR', state, dispatch, actions, appendOutput);

            expect(actions.updateStat).toHaveBeenCalledWith({ stat: 'debt', value: 500 });
            expect(actions.setLastBillDay).toHaveBeenCalledWith(7);
            expect(appendOutput).toHaveBeenCalled();
        });

        it('triggers game over when debt exceeds limit', () => {
            const state = makeState({
                player: { stats: { atmosphere: 100, sanity: 100, debt: 2500 }, lastBillDay: 0 },
            });
            afterCommand('DIR', state, dispatch, actions, appendOutput);

            expect(actions.setGameOver).toHaveBeenCalledWith('debt');
        });
    });
});
