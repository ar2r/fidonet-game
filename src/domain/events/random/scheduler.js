/**
 * Random Event Scheduler
 * Checks for random events based on game state and probability.
 * Implements cooldown system to prevent same event firing consecutively.
 */

// --- Cooldown state (module-level) ---
let lastEventId = null;
let neighborCooldownUntilDay = 0;

/** Reset cooldown state (for testing) */
export function resetCooldowns() {
    lastEventId = null;
    neighborCooldownUntilDay = 0;
}

// --- Event definitions ---

const RANDOM_EVENTS = [
    {
        id: 'mom_pickup',
        chance: 0.05,
        condition: (gs) => {
            const { phase } = gs.gameState;
            const { connected } = gs.network;
            // Only when connected at night; chance scales with low atmosphere
            return connected && phase === 'night';
        },
        getChance: (gs) => {
            const { atmosphere } = gs.player.stats;
            const patienceFactor = (100 - atmosphere) * 0.002;
            return 0.05 + patienceFactor;
        },
        effect: (dispatch, actions, appendOutput) => {
            appendOutput("");
            appendOutput("ЩЕЛЧОК В ЛИНИИ...");
            appendOutput("Кто-то снял трубку в коридоре!");
            appendOutput("— Опять этот интернет! Спать мешаешь!");
            appendOutput("");
            appendOutput("NO CARRIER");
            dispatch(actions.disconnect());
            dispatch(actions.updateStat({ stat: 'sanity', value: -10 }));
            dispatch(actions.updateStat({ stat: 'atmosphere', value: -20 }));
        },
    },
    {
        id: 'mom_knocks',
        chance: 0.08,
        condition: (gs) => {
            const minutes = gs.gameState.timeMinutes;
            const wrapped = ((minutes % 1440) + 1440) % 1440;
            // After 23:00 (1380 minutes)
            return wrapped >= 1380 || wrapped < 360;
        },
        effect: (dispatch, actions, appendOutput) => {
            appendOutput("");
            appendOutput("*** СТУК В ДВЕРЬ ***");
            appendOutput("Мама стучит в дверь: «Ты опять за компьютером?! Спать немедленно!»");
            appendOutput("Атмосфера в доме ухудшилась...");
            appendOutput("");
            dispatch(actions.updateStat({ stat: 'atmosphere', value: -15 }));
        },
    },
    {
        id: 'power_flicker',
        chance: 0.03,
        condition: () => true, // can happen any time
        effect: (dispatch, actions, appendOutput) => {
            appendOutput("");
            appendOutput("Свет мигнул... Монитор моргнул на секунду.");
            appendOutput("Кажется, пронесло. В этот раз.");
            appendOutput("");
            dispatch(actions.updateStat({ stat: 'sanity', value: -3 }));
        },
    },
    {
        id: 'wrong_number',
        chance: 0.04,
        condition: (gs) => {
            // Only in IDLE mode (modem not connected)
            return !gs.network.connected && gs.network.modemInitialized;
        },
        effect: (_dispatch, _actions, appendOutput) => {
            const phrases = [
                "Модем снял трубку: «Алло? Это прачечная?» *гудки*",
                "Модем снял трубку: «Алло, Марь Иванна? Это Зинаида...» *гудки*",
                "Модем снял трубку: «Здравствуйте, это из поликлиники звонят...» *гудки*",
                "Модем снял трубку: «Алло! Ну ты когда деньги отдашь?!» *гудки*",
            ];
            const msg = phrases[Math.floor(Math.random() * phrases.length)];
            appendOutput("");
            appendOutput("RING RING RING...");
            appendOutput(msg);
            appendOutput("");
        },
    },
    {
        id: 'neighbor_help',
        chance: 0.06,
        condition: (gs) => {
            const { phase } = gs.gameState;
            const { day } = gs.gameState;
            // Only during daytime, respects cooldown
            return phase === 'day' && day >= neighborCooldownUntilDay;
        },
        effect: (dispatch, actions, appendOutput, gs) => {
            const payment = 200 + Math.floor(Math.random() * 300); // 200-500 rub
            appendOutput("");
            appendOutput("*** ЗВОНОК В ДВЕРЬ ***");
            appendOutput(`Звонит сосед: «Слушай, можешь прийти Windows переустановить? Заплачу ${payment} руб.!»`);
            appendOutput(`Вы получили ${payment} руб. за помощь соседу.`);
            appendOutput("");
            dispatch(actions.updateStat({ stat: 'money', value: payment }));
            dispatch(actions.updateSkill({ skill: 'hardware', value: 1 }));
            // Cooldown: don't trigger for 3 days
            neighborCooldownUntilDay = gs.gameState.day + 3;
        },
    },
];

/**
 * Check and trigger random events.
 * Only one event fires per tick. Cooldown prevents consecutive repeats.
 * @param {Object} gameState - Current Redux state snapshot
 * @param {Function} dispatch - Redux dispatch
 * @param {Object} actions - Redux action creators
 * @param {Function} appendOutput - Terminal output callback
 */
export function checkRandomEvents(gameState, dispatch, actions, appendOutput) {
    // Shuffle to avoid ordering bias
    const shuffled = [...RANDOM_EVENTS].sort(() => Math.random() - 0.5);

    for (const event of shuffled) {
        // Skip if this was the last event (cooldown)
        if (event.id === lastEventId) continue;

        // Check condition
        if (!event.condition(gameState)) continue;

        // Determine chance (some events have dynamic chance)
        const chance = event.getChance
            ? event.getChance(gameState)
            : event.chance;

        if (Math.random() < chance) {
            event.effect(dispatch, actions, appendOutput, gameState);
            lastEventId = event.id;
            return; // Only one event per tick
        }
    }
}

/** Exported for testing */
export { RANDOM_EVENTS };
