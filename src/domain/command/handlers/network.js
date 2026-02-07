import { eventBus } from '../../events/bus';
import { MODEM_INITIALIZED, BBS_CONNECTED } from '../../events/types';
import { BBS_WELCOME, BBS_MENU } from '../../../assets/ascii';
import { completeQuestAndProgress } from '../../../engine/questEngine';

/**
 * Network / Modem Handlers
 */

function triggerQuest(questId, gameState, dispatch, actions, appendOutput) {
    if (gameState.quests?.active !== questId) return;
    if (gameState.quests?.completed?.includes(questId)) return;

    const notifications = completeQuestAndProgress(questId, dispatch, actions);
    if (notifications) {
        appendOutput('');
        notifications.forEach(line => appendOutput(line));
    }
}

export function handleTerminal({ gameState, dispatch, actions, appendOutput }) {
    const terminalProgramRunning = gameState.network?.terminalProgramRunning || false;

    if (terminalProgramRunning) {
        appendOutput("TERMINAL.EXE уже запущен.");
    } else {
        dispatch(actions.setTerminalProgram(true));
        appendOutput("");
        appendOutput("╔═══════════════════════════════════════════╗");
        appendOutput("║        TERMINAL v3.14 (c) 1993            ║");
        appendOutput("║    Простая терминальная программа         ║");
        appendOutput("╚═══════════════════════════════════════════╝");
        appendOutput("");
        appendOutput("Для выхода из TERMINAL наберите EXIT.");
        appendOutput("");
    }
    return { handled: true };
}

export function handleAtz({ gameState, dispatch, actions, appendOutput }) {
    const terminalProgramRunning = gameState.network?.terminalProgramRunning || false;

    if (!terminalProgramRunning) {
        appendOutput("ОШИБКА: Неверная команда или имя файла");
        appendOutput("Для работы с модемом запустите TERMINAL.EXE");
        return { handled: true };
    }
    dispatch(actions.initializeModem());
    appendOutput("OK");

    // Publish domain event
    eventBus.publish(MODEM_INITIALIZED, { command: 'ATZ' });

    // Quest: init_modem
    triggerQuest('init_modem', gameState, dispatch, actions, appendOutput);

    return { handled: true };
}

export function handleDial({ command, gameState, dispatch, actions, appendOutput }) {
    const terminalProgramRunning = gameState.network?.terminalProgramRunning || false;

    if (!terminalProgramRunning) {
        appendOutput("ОШИБКА: Неверная команда или имя файла");
        appendOutput("Для звонков на BBS запустите TERMINAL.EXE");
        return { handled: true };
    }

    const parts = command.split(/\s+/);
    let number = '';
    if (command.startsWith('DIAL')) {
        number = parts.length > 1 ? parts[1] : '';
    } else {
        // ATDT or ATDP
        const prefix = command.startsWith('ATDT') ? 'ATDT' : 'ATDP';
        const afterPrefix = command.substring(prefix.length).trim();
        number = afterPrefix || (parts.length > 1 ? parts[1] : '');
    }

    if (!gameState.network?.modemInitialized) {
        appendOutput("ОШИБКА: Модем не инициализирован.");
        appendOutput("Введите ATZ для инициализации.");
        return { handled: true };
    }

    if (number === '555-3389') {
        appendOutput(`НАБОР НОМЕРА ${number}...`);
        setTimeout(() => {
            appendOutput("СОЕДИНЕНИЕ 14400");
            setTimeout(() => {
                appendOutput("REL 1.0");
                appendOutput("");
                dispatch(actions.connect('The Nexus BBS'));
                dispatch(actions.setTerminalMode('BBS_MENU'));
                appendOutput(BBS_WELCOME);
                appendOutput("");
                appendOutput("Логин: Гость");
                appendOutput("Доступ разрешён.");

                // Publish domain event
                eventBus.publish(BBS_CONNECTED, {
                    bbs: 'The Nexus',
                    phone: number,
                });

                // Quest: first_connect
                triggerQuest('first_connect', gameState, dispatch, actions, appendOutput);

                appendOutput("");
                appendOutput(BBS_MENU);
            }, 1500);
        }, 1000);
    } else if (number) {
        appendOutput(`НАБОР НОМЕРА ${number}...`);
        setTimeout(() => appendOutput("НЕТ НЕСУЩЕЙ"), 2000);
    } else {
        appendOutput("ОШИБКА: Не указан номер.");
    }

    return { handled: true };
}

export function handleExit({ gameState, dispatch, actions, appendOutput }) {
    const terminalProgramRunning = gameState.network?.terminalProgramRunning || false;

    if (gameState.network?.connected) {
        dispatch(actions.disconnect());
        appendOutput("Отключение...");
        appendOutput("NO CARRIER");
    } else if (terminalProgramRunning) {
        dispatch(actions.setTerminalProgram(false));
        appendOutput("Выход из TERMINAL.EXE...");
        appendOutput("");
    } else {
        appendOutput("Нет активного соединения.");
    }

    return { handled: true };
}
