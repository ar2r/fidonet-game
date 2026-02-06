import { FIDO_BANNER, BBS_MENU, MODEM_CONNECT } from '../assets/ascii';
import { GAME_MANUAL } from '../assets/text';

export const processCommand = (cmd, gameState, dispatch, actions, appendOutput) => {
    const command = cmd.trim().toUpperCase();
    const { connect, completeQuest, initializeModem } = actions;
    // note: we can't require actions here easily because store.js exports actions separately. 
    // Better to pass actions or just dispatch objects. 
    // Wait, I should import actions at top level if possible, but circular deps might be an issue if store imports this.
    // Let's assume dispatch handles the action objects directly or we import them.
    // Actually, `commandParser` is a pure function helper. I should import action creators at the top.

    // Act 1: The Connect
    // checking gameState.act might be tricky if it's in Redux now. 
    // I'll assume gameState passed in is the *full* redux state or at least the relevant slice.

    // Let's look at how I'll call this. 
    // In TerminalWindow: processCommand(cmd, { gameState, player, network, quests }, dispatch, appendOutput)

    // Let's rely on the passed gameState structure.

    if (command === 'ATZ' || command === 'AT&F') {
        if (initializeModem) dispatch(initializeModem());
        appendOutput("OK");
    } else if (command === 'CLS' || command === 'CLEAR') {
        return 'CLEAR';
    } else if (command === 'HELP' || command === 'MANUAL') {
        appendOutput(GAME_MANUAL);
    } else if (command.startsWith('ATDT') || command.startsWith('ATDP') || command.startsWith('DIAL')) {
        const parts = command.split(' ');
        const number = parts.length > 1 ? parts[1] : '';

        if (number === '555-3389') {
            appendOutput(`НАБОР НОМЕРА ${number}...`);
            setTimeout(() => {
                appendOutput("СОЕДИНЕНИЕ 14400");
                setTimeout(() => {
                    appendOutput("REL 1.0");
                    appendOutput("");
                    appendOutput("Добро пожаловать на THE NEXUS BBS");
                    appendOutput("------------------------");
                    appendOutput("SysOp: Архитектор");
                    appendOutput("");
                    appendOutput("проверка соединения...");
                    setTimeout(() => {
                        appendOutput("Логин: Гость");
                        appendOutput("Доступ разрешен.");

                        // Dispatch actions
                        if (connect) dispatch(connect('The Nexus BBS'));
                        if (completeQuest) dispatch(completeQuest('get_online'));

                        appendOutput("Нажмите Enter для продолжения...");
                    }, 2000);
                }, 1500);
            }, 1000);
        } else if (number) {
            appendOutput(`НАБОР НОМЕРА ${number}...`);
            setTimeout(() => appendOutput("НЕТ НЕСУЩЕЙ"), 2000);
        } else {
            appendOutput("ОШИБКА: Не указан номер.");
        }
    } else {
        appendOutput("Неверная команда или имя файла");
    }
};
