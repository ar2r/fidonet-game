import fs from '../../../engine/fileSystemInstance';
import { GAME_MANUAL, TERMINAL_MANUAL } from '../../../assets/text';
import { getQuestById } from '../../../content/quests';

/**
 * IDLE Mode Handlers (DOS Commands)
 */

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

export function handleDir({ command, appendOutput }) {
    const cmdUpper = command.toUpperCase();
    if (cmdUpper === 'DIR' || cmdUpper === 'LS') {
        const result = fs.ls();
        const lines = formatDirListing(result, fs.pwd());
        lines.forEach(l => appendOutput(l));
    } else {
        // DIR <path>
        const path = command.substring(4).trim();
        const result = fs.ls(path);
        const lines = formatDirListing(result, path.toUpperCase());
        lines.forEach(l => appendOutput(l));
    }
    return { handled: true };
}

export function handleCd({ command, appendOutput }) {
    const cmdUpper = command.toUpperCase();
    let path;
    if (cmdUpper.startsWith('CD\\')) {
        path = command.substring(2);
    } else if (cmdUpper.startsWith('CD ')) {
        path = command.substring(3).trim();
    } else if (cmdUpper === 'CD') {
        appendOutput(fs.pwd());
        return { handled: true };
    } else {
        return { handled: false };
    }

    if (path === '\\' || path === '') {
        fs.currentPath = ['C:'];
    } else {
        const result = fs.cd(path);
        if (!result.ok) {
            appendOutput(result.error);
        }
    }
    return { handled: true };
}

export function handleType({ command, appendOutput }) {
    const cmdUpper = command.toUpperCase();
    const prefixLen = cmdUpper.startsWith('TYPE') ? 5 : 4; // TYPE or CAT
    const path = command.substring(prefixLen).trim();
    const result = fs.cat(path);
    if (result.ok) {
        appendOutput(result.content);
    } else {
        appendOutput(result.error);
    }
    return { handled: true };
}

export function handleVer({ appendOutput }) {
    appendOutput("MS-DOS Version 6.22");
    return { handled: true };
}

export function handleDate({ gameState, appendOutput }) {
    const time = gameState.gameState?.time || '23:00';
    const day = gameState.gameState?.day || 1;
    appendOutput(`День: ${day}  Время: ${time}`);
    return { handled: true };
}

export function handleTime({ gameState, appendOutput }) {
    const time = gameState.gameState?.time || '23:00';
    appendOutput(`Текущее время: ${time}`);
    return { handled: true };
}

export function handleTree({ appendOutput }) {
    appendOutput(fs.pwd());
    const lines = fs.tree();
    lines.forEach(l => appendOutput(l));
    return { handled: true };
}

export function handleCls() {
    return { handled: true, output: 'CLEAR' };
}

export function handleHelp({ gameState, appendOutput }) {
    if (gameState.network?.terminalProgramRunning) {
        appendOutput(TERMINAL_MANUAL);
    } else {
        appendOutput(GAME_MANUAL);
    }
    return { handled: true };
}

export function handleHint({ gameState, appendOutput }) {
    const activeQuestId = gameState.quests?.active;
    if (!activeQuestId) {
        appendOutput("══════════════════════════════════════");
        appendOutput("  Нет активного квеста");
        appendOutput("");
        appendOutput("  Все задания выполнены!");
        appendOutput("══════════════════════════════════════");
    } else {
        const quest = getQuestById(activeQuestId);
        if (quest) {
            appendOutput("══════════════════════════════════════");
            appendOutput(`  ${quest.title}`);
            appendOutput("══════════════════════════════════════");
            appendOutput("");
            appendOutput(`Цель: ${quest.description}`);
            appendOutput("");
            if (quest.hint) {
                appendOutput(`💡 Подсказка: ${quest.hint}`);
                appendOutput("");
            }
            if (quest.steps && quest.steps.length > 0) {
                appendOutput("Шаги:");
                quest.steps.forEach((step, index) => {
                    const desc = step.description || step.id;
                    appendOutput(`  ${index + 1}. ${desc}`);
                });
                appendOutput("");
            }
            appendOutput("Подробнее: дважды щелкните 'Квесты'");
            appendOutput("на рабочем столе.");
            appendOutput("══════════════════════════════════════");
        } else {
            appendOutput(`Квест "${activeQuestId}" не найден.`);
        }
    }
    return { handled: true };
}