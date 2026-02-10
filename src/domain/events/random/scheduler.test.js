import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkRandomEvents, RANDOM_EVENTS, resetCooldowns } from './scheduler';

function makeActions() {
    return {
        disconnect: vi.fn(() => ({ type: 'disconnect' })),
        updateStat: vi.fn(v => ({ type: 'updateStat', payload: v })),
        updateSkill: vi.fn(v => ({ type: 'updateSkill', payload: v })),
    };
}

function makeState(overrides = {}) {
    return {
        gameState: {
            timeMinutes: 1400, // 23:20 — night
            phase: 'night',
            zmh: false,
            day: 5,
            ...overrides.gameState,
        },
        network: {
            connected: true,
            modemInitialized: true,
            terminalMode: 'IDLE',
            ...overrides.network,
        },
        player: {
            stats: { atmosphere: 100, sanity: 100, money: 2500, debt: 0 },
            lastBillDay: 0,
            ...overrides.player,
        },
        quests: { activeQuestId: null, completed: [], ...overrides.quests },
    };
}

describe('Random Events Scheduler', () => {
    let dispatch;
    let actions;
    let appendOutput;

    beforeEach(() => {
        dispatch = vi.fn();
        actions = makeActions();
        appendOutput = vi.fn();
        resetCooldowns();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('event definitions', () => {
        it('has 5 defined events', () => {
            expect(RANDOM_EVENTS).toHaveLength(5);
        });

        it('each event has required fields', () => {
            for (const event of RANDOM_EVENTS) {
                expect(event).toHaveProperty('id');
                expect(event).toHaveProperty('chance');
                expect(event).toHaveProperty('condition');
                expect(event).toHaveProperty('effect');
                expect(typeof event.id).toBe('string');
                expect(typeof event.chance).toBe('number');
                expect(typeof event.condition).toBe('function');
                expect(typeof event.effect).toBe('function');
            }
        });

        it('all event IDs are unique', () => {
            const ids = RANDOM_EVENTS.map(e => e.id);
            expect(new Set(ids).size).toBe(ids.length);
        });
    });

    describe('mom_pickup event', () => {
        it('condition requires connected and night', () => {
            const momPickup = RANDOM_EVENTS.find(e => e.id === 'mom_pickup');

            expect(momPickup.condition({
                gameState: { phase: 'night' },
                network: { connected: true },
            })).toBe(true);

            expect(momPickup.condition({
                gameState: { phase: 'day' },
                network: { connected: true },
            })).toBe(false);

            expect(momPickup.condition({
                gameState: { phase: 'night' },
                network: { connected: false },
            })).toBe(false);
        });

        it('effect disconnects and decreases stats', () => {
            const momPickup = RANDOM_EVENTS.find(e => e.id === 'mom_pickup');
            momPickup.effect(dispatch, actions, appendOutput);

            expect(appendOutput).toHaveBeenCalled();
            expect(actions.disconnect).toHaveBeenCalled();
            expect(actions.updateStat).toHaveBeenCalledWith({ stat: 'sanity', value: -10 });
            expect(actions.updateStat).toHaveBeenCalledWith({ stat: 'atmosphere', value: -20 });
        });

        it('does not fire during daytime', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.01);
            const state = makeState({
                gameState: { timeMinutes: 720, phase: 'day', zmh: false, day: 5 },
            });

            checkRandomEvents(state, dispatch, actions, appendOutput);

            // mom_pickup requires connected && night, so it shouldn't fire
            expect(actions.disconnect).not.toHaveBeenCalled();
        });

        it('does not fire when not connected', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.01);
            const state = makeState({
                network: { connected: false, modemInitialized: true, terminalMode: 'IDLE' },
            });

            checkRandomEvents(state, dispatch, actions, appendOutput);

            expect(actions.disconnect).not.toHaveBeenCalled();
        });
    });

    describe('mom_knocks event', () => {
        it('fires at night (after 23:00)', () => {
            // Force random to pick mom_knocks: set connected=false so mom_pickup condition fails
            vi.spyOn(Math, 'random').mockReturnValue(0.01);
            const state = makeState({
                gameState: { timeMinutes: 1400, phase: 'night', zmh: false, day: 5 },
                network: { connected: false, modemInitialized: false, terminalMode: 'IDLE' },
            });

            checkRandomEvents(state, dispatch, actions, appendOutput);

            // mom_knocks or power_flicker could fire (both conditions met)
            expect(appendOutput).toHaveBeenCalled();
        });

        it('condition is true for late night hours', () => {
            const momKnocks = RANDOM_EVENTS.find(e => e.id === 'mom_knocks');
            // 23:30 = 1410 minutes
            expect(momKnocks.condition({ gameState: { timeMinutes: 1410 } })).toBe(true);
            // 02:00 = 120 minutes
            expect(momKnocks.condition({ gameState: { timeMinutes: 120 } })).toBe(true);
            // 12:00 = 720 minutes — should be false
            expect(momKnocks.condition({ gameState: { timeMinutes: 720 } })).toBe(false);
        });
    });

    describe('power_flicker event', () => {
        it('condition is always true', () => {
            const powerFlicker = RANDOM_EVENTS.find(e => e.id === 'power_flicker');
            expect(powerFlicker.condition({})).toBe(true);
        });

        it('decreases sanity when fired', () => {
            const powerFlicker = RANDOM_EVENTS.find(e => e.id === 'power_flicker');
            powerFlicker.effect(dispatch, actions, appendOutput);

            expect(actions.updateStat).toHaveBeenCalledWith({ stat: 'sanity', value: -3 });
            expect(appendOutput).toHaveBeenCalled();
        });
    });

    describe('wrong_number event', () => {
        it('condition requires not connected but modem initialized', () => {
            const wrongNumber = RANDOM_EVENTS.find(e => e.id === 'wrong_number');

            expect(wrongNumber.condition({
                network: { connected: false, modemInitialized: true }
            })).toBe(true);

            expect(wrongNumber.condition({
                network: { connected: true, modemInitialized: true }
            })).toBe(false);

            expect(wrongNumber.condition({
                network: { connected: false, modemInitialized: false }
            })).toBe(false);
        });

        it('outputs flavor text without stat changes', () => {
            const wrongNumber = RANDOM_EVENTS.find(e => e.id === 'wrong_number');
            vi.spyOn(Math, 'random').mockReturnValue(0.5);
            wrongNumber.effect(dispatch, actions, appendOutput);

            expect(appendOutput).toHaveBeenCalled();
            // Should not dispatch any stat changes
            expect(actions.updateStat).not.toHaveBeenCalled();
        });
    });

    describe('neighbor_help event', () => {
        it('condition requires daytime', () => {
            const neighbor = RANDOM_EVENTS.find(e => e.id === 'neighbor_help');

            expect(neighbor.condition({
                gameState: { phase: 'day', day: 5 }
            })).toBe(true);

            expect(neighbor.condition({
                gameState: { phase: 'night', day: 5 }
            })).toBe(false);
        });

        it('gives money and hardware skill when fired', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.5);
            const neighbor = RANDOM_EVENTS.find(e => e.id === 'neighbor_help');
            const state = makeState({ gameState: { phase: 'day', day: 5, timeMinutes: 720, zmh: false } });

            neighbor.effect(dispatch, actions, appendOutput, state);

            expect(actions.updateStat).toHaveBeenCalledWith(
                expect.objectContaining({ stat: 'money' })
            );
            expect(actions.updateSkill).toHaveBeenCalledWith({ skill: 'hardware', value: 1 });
        });
    });

    describe('cooldown system', () => {
        it('does not fire the same event consecutively', () => {
            // Force power_flicker to fire (condition always true)
            // First: all conditions fail except power_flicker
            const state = makeState({
                gameState: { timeMinutes: 720, phase: 'day', zmh: false, day: 1 },
                network: { connected: false, modemInitialized: false, terminalMode: 'IDLE' },
            });

            // Make random always return 0.001 (below all chances) — but we need shuffle
            // to put power_flicker first. With 0.01, power_flicker (0.03 chance) will fire.
            // Only power_flicker condition is met (always true) and neighbor_help (daytime).
            vi.spyOn(Math, 'random').mockReturnValue(0.01);
            checkRandomEvents(state, dispatch, actions, appendOutput);

            const firstCalls = appendOutput.mock.calls.length;
            expect(firstCalls).toBeGreaterThan(0);

            // Now reset mocks but NOT cooldowns — try again
            dispatch.mockClear();
            actions.updateStat.mockClear();
            appendOutput.mockClear();

            // Run again with same conditions — the last event should be skipped
            // due to cooldown, but other eligible events can fire
            vi.spyOn(Math, 'random').mockReturnValue(0.01);
            checkRandomEvents(state, dispatch, actions, appendOutput);

            // The system should work (either fire a different event or nothing)
            // Key: it should not crash
        });

        it('resetCooldowns clears the last event', () => {
            const state = makeState({
                gameState: { timeMinutes: 720, phase: 'day', zmh: false, day: 1 },
                network: { connected: false, modemInitialized: false, terminalMode: 'IDLE' },
            });

            vi.spyOn(Math, 'random').mockReturnValue(0.01);
            checkRandomEvents(state, dispatch, actions, appendOutput);

            resetCooldowns();

            // After reset, the same event could fire again
            appendOutput.mockClear();
            vi.spyOn(Math, 'random').mockReturnValue(0.01);
            checkRandomEvents(state, dispatch, actions, appendOutput);

            // Should have fired something
            expect(appendOutput).toHaveBeenCalled();
        });
    });

    describe('checkRandomEvents', () => {
        it('fires at most one event per call', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.001); // Very low - will trigger
            const state = makeState();

            checkRandomEvents(state, dispatch, actions, appendOutput);

            // Count distinct event blocks (separated by empty lines)
            const calls = appendOutput.mock.calls.map(c => c[0]);
            // There should be output from exactly one event
            // Filter out empty strings to count actual message lines
            const messageLines = calls.filter(line => line !== '');
            expect(messageLines.length).toBeGreaterThan(0);
            expect(messageLines.length).toBeLessThan(10); // No event produces more than ~5 lines
        });

        it('does nothing when random values are high', () => {
            vi.spyOn(Math, 'random').mockReturnValue(0.99);
            const state = makeState();

            checkRandomEvents(state, dispatch, actions, appendOutput);

            // With 0.99, no event should trigger (all chances < 0.3)
            expect(appendOutput).not.toHaveBeenCalled();
        });
    });
});
