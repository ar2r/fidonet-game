import { BBS_WELCOME, BBS_MENU, BBS_FILES, BBS_CHAT_SYSOP, DOWNLOAD_PROGRESS } from '../assets/ascii';
import { GAME_MANUAL } from '../assets/text';
import fs from './fileSystemInstance';
import { completeQuestAndProgress, checkDownloadQuestCompletion } from './questEngine';

function simulateDownload(filename, appendOutput, onComplete) {
    const steps = [0, 10, 25, 40, 55, 70, 85, 100];
    let i = 0;
    const tick = () => {
        if (i < steps.length) {
            appendOutput(DOWNLOAD_PROGRESS(filename, steps[i]));
            i++;
            setTimeout(tick, 300);
        } else {
            appendOutput(`${filename} — загрузка завершена!`);
            onComplete();
        }
    };
    tick();
}

function formatDirEntry(entry) {
    const name = entry.name.padEnd(14);
    if (entry.type === 'DIR') {
        return `${name} <DIR>`;
    }
    const size = String(entry.size).padStart(8);
    return `${name} ${size}`;
}

function formatDirListing(result, path) {
    if (!result.ok) return [result.error];

    const lines = [];
    lines.push(` Каталог ${path}`);
    lines.push('');

    let dirs = 0;
    let files = 0;
    let totalSize = 0;

    for (const entry of result.entries) {
        lines.push(formatDirEntry(entry));
        if (entry.type === 'DIR') dirs++;
        else {
            files++;
            totalSize += entry.size;
        }
    }

    lines.push('');
    lines.push(`     ${files} файл(ов)  ${totalSize} байт`);
    lines.push(`     ${dirs} каталог(ов)`);
    return lines;
}

function triggerQuest(questId, gameState, dispatch, actions, appendOutput) {
    if (gameState.quests?.active !== questId) return;
    if (gameState.quests?.completed?.includes(questId)) return;

    const notifications = completeQuestAndProgress(questId, dispatch, actions);
    if (notifications) {
        appendOutput('');
        notifications.forEach(line => appendOutput(line));
    }
}

export function getPrompt() {
    return fs.promptPath();
}

export const processCommand = (cmd, gameState, dispatch, actions, appendOutput) => {
    const command = cmd.trim().toUpperCase();
    const { connect, disconnect, initializeModem, setTerminalMode, addItem } = actions;
    const terminalMode = gameState.network?.terminalMode || 'IDLE';

    // --- BBS_MENU mode ---
    if (terminalMode === 'BBS_MENU') {
        if (command === 'F') {
            dispatch(setTerminalMode('BBS_FILES'));
            appendOutput(BBS_FILES);
        } else if (command === 'M') {
            appendOutput("Почтовая область пока недоступна.");
            appendOutput("У вас не настроен мейлер.");
            appendOutput("");
            appendOutput(BBS_MENU);
        } else if (command === 'C') {
            dispatch(setTerminalMode('BBS_CHAT'));
            appendOutput(BBS_CHAT_SYSOP);
        } else if (command === 'G') {
            dispatch(disconnect());
            appendOutput("Отключение от BBS...");
            appendOutput("NO CARRIER");
            appendOutput("");
        } else {
            appendOutput("Неверный выбор. Введите F, M, C или G.");
            appendOutput("");
            appendOutput(BBS_MENU);
        }
        return;
    }

    // --- BBS_FILES mode ---
    if (terminalMode === 'BBS_FILES') {
        if (command === '1') {
            appendOutput("Начинаю загрузку T-Mail v2605...");
            appendOutput("Протокол: Zmodem");
            appendOutput("");
            simulateDownload("T-MAIL.EXE", appendOutput, () => {
                dispatch(addItem('t-mail'));
                fs.createFile('C:\\FIDO\\T-MAIL.EXE', '[T-Mail v2605 Executable]');
                fs.createFile('C:\\FIDO\\T-MAIL.CTL', '; T-Mail Configuration\n; Заполните поля ниже\n\nAddress \nPassword \nBossAddress \nBossPhone \nInbound C:\\FIDO\\INBOUND\nOutbound C:\\FIDO\\OUTBOUND\n');
                appendOutput("");
                appendOutput("T-Mail установлен в C:\\FIDO\\T-MAIL.EXE");
                appendOutput("Конфиг: C:\\FIDO\\T-MAIL.CTL");

                // Check if download_software quest is complete
                const inventory = [...(gameState.player?.inventory || []), 't-mail'];
                if (checkDownloadQuestCompletion(inventory, gameState.quests?.active)) {
                    triggerQuest('download_software', gameState, dispatch, actions, appendOutput);
                }

                appendOutput("");
                appendOutput(BBS_FILES);
            });
        } else if (command === '2') {
            appendOutput("Начинаю загрузку GoldED 2.50+...");
            appendOutput("Протокол: Zmodem");
            appendOutput("");
            simulateDownload("GOLDED.EXE", appendOutput, () => {
                dispatch(addItem('golded'));
                fs.createFile('C:\\FIDO\\GOLDED.EXE', '[GoldED 2.50+ Executable]');
                fs.createFile('C:\\FIDO\\GOLDED.CFG', '; GoldED Configuration\n; Заполните поля ниже\n\nUsername \nAddress \nOrigin \n');
                appendOutput("");
                appendOutput("GoldED установлен в C:\\FIDO\\GOLDED.EXE");
                appendOutput("Конфиг: C:\\FIDO\\GOLDED.CFG");

                // Check if download_software quest is complete
                const inventory = [...(gameState.player?.inventory || []), 'golded'];
                if (checkDownloadQuestCompletion(inventory, gameState.quests?.active)) {
                    triggerQuest('download_software', gameState, dispatch, actions, appendOutput);
                }

                appendOutput("");
                appendOutput(BBS_FILES);
            });
        } else if (command === '3') {
            appendOutput("DOOM2.WAD — 4.2MB");
            appendOutput("ОШИБКА: Недостаточно места на диске!");
            appendOutput("");
            appendOutput(BBS_FILES);
        } else if (command === 'Q') {
            dispatch(setTerminalMode('BBS_MENU'));
            appendOutput(BBS_MENU);
        } else {
            appendOutput("Неверный выбор. Введите 1, 2, 3 или Q.");
            appendOutput("");
            appendOutput(BBS_FILES);
        }
        return;
    }

    // --- BBS_CHAT mode ---
    if (terminalMode === 'BBS_CHAT') {
        dispatch(setTerminalMode('BBS_MENU'));
        appendOutput(BBS_MENU);
        return;
    }

    // --- IDLE mode (DOS terminal) ---

    if (command === 'ATZ' || command === 'AT&F') {
        dispatch(initializeModem());
        appendOutput("OK");
        // Quest: init_modem
        triggerQuest('init_modem', gameState, dispatch, actions, appendOutput);
    } else if (command === 'CLS' || command === 'CLEAR') {
        return 'CLEAR';
    } else if (command === 'HELP' || command === 'MANUAL') {
        appendOutput(GAME_MANUAL);
    } else if (command === 'DIR' || command === 'LS') {
        const result = fs.ls();
        const lines = formatDirListing(result, fs.pwd());
        lines.forEach(l => appendOutput(l));
    } else if (command.startsWith('DIR ')) {
        const path = cmd.trim().substring(4).trim();
        const result = fs.ls(path);
        const lines = formatDirListing(result, path.toUpperCase());
        lines.forEach(l => appendOutput(l));
    } else if (command.startsWith('CD ') || command.startsWith('CD\\')) {
        let path;
        if (command.startsWith('CD\\')) {
            path = cmd.trim().substring(2);
        } else {
            path = cmd.trim().substring(3).trim();
        }
        if (path === '\\' || path === '') {
            fs.currentPath = ['C:'];
        } else {
            const result = fs.cd(path);
            if (!result.ok) {
                appendOutput(result.error);
            }
        }
    } else if (command === 'CD') {
        appendOutput(fs.pwd());
    } else if (command.startsWith('TYPE ') || command.startsWith('CAT ')) {
        const prefixLen = command.startsWith('TYPE') ? 5 : 4;
        const path = cmd.trim().substring(prefixLen).trim();
        const result = fs.cat(path);
        if (result.ok) {
            appendOutput(result.content);
        } else {
            appendOutput(result.error);
        }
    } else if (command === 'VER') {
        appendOutput("MS-DOS Version 6.22");
    } else if (command === 'DATE') {
        const time = gameState.gameState?.time || '23:00';
        const day = gameState.gameState?.day || 1;
        appendOutput(`День: ${day}  Время: ${time}`);
    } else if (command === 'TIME') {
        const time = gameState.gameState?.time || '23:00';
        appendOutput(`Текущее время: ${time}`);
    } else if (command === 'TREE') {
        appendOutput(fs.pwd());
        const lines = fs.tree();
        lines.forEach(l => appendOutput(l));
    } else if (command.startsWith('ATDT') || command.startsWith('ATDP') || command.startsWith('DIAL')) {
        const parts = command.split(/\s+/);
        let number = '';
        if (command.startsWith('DIAL')) {
            number = parts.length > 1 ? parts[1] : '';
        } else {
            const prefix = command.startsWith('ATDT') ? 'ATDT' : 'ATDP';
            const afterPrefix = command.substring(prefix.length).trim();
            number = afterPrefix || (parts.length > 1 ? parts[1] : '');
        }

        if (!gameState.network?.modemInitialized) {
            appendOutput("ОШИБКА: Модем не инициализирован.");
            appendOutput("Введите ATZ для инициализации.");
            return;
        }

        if (number === '555-3389') {
            appendOutput(`НАБОР НОМЕРА ${number}...`);
            setTimeout(() => {
                appendOutput("СОЕДИНЕНИЕ 14400");
                setTimeout(() => {
                    appendOutput("REL 1.0");
                    appendOutput("");
                    dispatch(connect('The Nexus BBS'));
                    dispatch(setTerminalMode('BBS_MENU'));
                    appendOutput(BBS_WELCOME);
                    appendOutput("");
                    appendOutput("Логин: Гость");
                    appendOutput("Доступ разрешён.");

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
    } else if (command === 'EXIT' || command === 'QUIT') {
        if (gameState.network?.connected) {
            dispatch(disconnect());
            appendOutput("Отключение...");
            appendOutput("NO CARRIER");
        } else {
            appendOutput("Нет активного соединения.");
        }
    } else if (command === '') {
        // Empty command — do nothing
    } else {
        appendOutput("Неверная команда или имя файла");
    }
};
