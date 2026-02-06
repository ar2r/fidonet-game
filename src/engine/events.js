import { FIDO_BANNER } from '../assets/ascii';

export const EVENTS = [
    {
        id: 'KUROCHKA_RYABA',
        chance: 0.05, // 5% chance per tick if conditions met
        trigger: (state) => {
            // Trigger in Act 2 (after getting software) or if explicitly infected
            return state.act >= 2 && !state.activeViruses.includes('kurochka_immune');
        },
        action: (dispatch, state, addLog) => {
            // If already has virus, do spam
            if (state.activeViruses.includes('kurochka')) {
                addLog("INCOMING MAIL: Re: Skazka pro Kurochku...");
                addLog("Auto-Posting to ECHO: SU.GENERAL...");
                addLog("SysOp: WARNING! Stop spamming or you will be banned!");
                // Decrease karma (conceptually)
            } else {
                // First infection
                dispatch({ activeViruses: [...state.activeViruses, 'kurochka'] });
                addLog("You received a new message: 'Little Hen Ryaba'.");
                addLog("Subject: READ IMMEDIATELY");
            }
        }
    }
];

export const processEvents = (gameState, updateState, addLog) => {
    EVENTS.forEach(event => {
        if (event.trigger(gameState)) {
            if (Math.random() < event.chance) {
                event.action(updateState, gameState, addLog);
            }
        }
    });
};
