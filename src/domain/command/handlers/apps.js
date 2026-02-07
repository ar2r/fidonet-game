/**
 * Application Handlers (Games, Utils)
 */

export function handleDoom({ gameState, dispatch, actions, appendOutput }) {
    const hasDoom = gameState.player?.inventory?.includes('doom2');
    const virusActive = gameState.gameState?.virusActive || false;

    if (!hasDoom) {
        appendOutput("Файл не найден: DOOM2.WAD");
        return { handled: true };
    }

    if (virusActive) {
        appendOutput("Программа уже запущена.");
        return { handled: true };
    }

    appendOutput("Запуск DOOM2.WAD...");
    appendOutput("");

    // Activate virus after short delay
    setTimeout(() => {
        dispatch(actions.setVirusActive(true));
        dispatch(actions.setVirusStage('cascade'));
        dispatch(actions.updateStat({ stat: 'sanity', value: -20 }));
        dispatch(actions.updateStat({ stat: 'momsPatience', value: -10 }));
    }, 1000);

    return { handled: true };
}

export function handleAidstest({ gameState, dispatch, actions, appendOutput }) {
    const virusActive = gameState.gameState?.virusActive || false;

    if (!virusActive) {
        appendOutput("AIDSTEST v1.03 (c) Д.Лозинский");
        appendOutput("Вирусов не обнаружено.");
        return { handled: true };
    }

    appendOutput("Запуск антивируса...");
    appendOutput("");

    // Start cleaning animation
    dispatch(actions.setVirusStage('cleaning'));

    // Complete cleaning after 5 seconds
    setTimeout(() => {
        dispatch(actions.setVirusActive(false));
        dispatch(actions.setVirusStage('none'));
        appendOutput("Система очищена от вирусов.");
        appendOutput("");
    }, 5000);

    return { handled: true };
}
