import { simulateDownload } from '../utils';
import fs from '../../../engine/fileSystemInstance';
import { README_FIDO } from '../../../assets/text';
import { BBS_FILES, BBS_MENU } from '../../../assets/ascii';
import { eventBus } from '../../events/bus';
import { DOWNLOAD_COMPLETED } from '../../events/types';
import { checkDownloadQuestCompletion, completeQuestAndProgress } from '../../../engine/questEngine';

function triggerQuest(questId, gameState, dispatch, actions, appendOutput) {
    if (gameState.quests?.active !== questId) return;
    if (gameState.quests?.completed?.includes(questId)) return;

    const notifications = completeQuestAndProgress(questId, dispatch, actions);
    if (notifications) {
        appendOutput('');
        notifications.forEach(line => appendOutput(line));
    }
}

export function handleDownloadTMail({ gameState, dispatch, actions, appendOutput }) {
    appendOutput("Начинаю загрузку T-Mail v2605...");
    appendOutput("Протокол: Zmodem");
    appendOutput("");
    simulateDownload("T-MAIL.EXE", appendOutput, () => {
        dispatch(actions.addItem('t-mail'));
        fs.createFile('C:\\FIDO\\T-MAIL.EXE', '[T-Mail v2605 Executable]');
        fs.createFile('C:\\FIDO\\T-MAIL.CTL', `; T-Mail Configuration
; Заполните поля ниже

Address 
Password 
BossAddress 
BossPhone 
Inbound C:\\FIDO\\INBOUND
Outbound C:\\FIDO\\OUTBOUND
`);
        appendOutput("");
        appendOutput("T-Mail установлен в C:\\FIDO\\T-MAIL.EXE");
        appendOutput("Конфиг: C:\\FIDO\\T-MAIL.CTL");

        // Publish domain event
        eventBus.publish(DOWNLOAD_COMPLETED, {
            item: 't-mail',
            source: 'BBS The Nexus',
        });

        // Check if download_software quest is complete
        const inventory = [...(gameState.player?.inventory || []), 't-mail'];
        if (checkDownloadQuestCompletion(inventory, gameState.quests?.active)) {
            triggerQuest('download_software', gameState, dispatch, actions, appendOutput);
        }

        appendOutput("");
        appendOutput(BBS_FILES);
    }, 45);
    return { handled: true };
}

export function handleDownloadGoldED({ gameState, dispatch, actions, appendOutput }) {
    appendOutput("Начинаю загрузку GoldED 2.50+...");
    appendOutput("Протокол: Zmodem");
    appendOutput("");
    simulateDownload("GOLDED.EXE", appendOutput, () => {
        dispatch(actions.addItem('golded'));
        fs.createFile('C:\\FIDO\\GOLDED.EXE', '[GoldED 2.50+ Executable]');
        fs.createFile('C:\\FIDO\\GOLDED.CFG', `; GoldED Configuration
; Заполните поля ниже

Username 
Address 
Origin 
`);
        appendOutput("");
        appendOutput("GoldED установлен в C:\\FIDO\\GOLDED.EXE");
        appendOutput("Конфиг: C:\\FIDO\\GOLDED.CFG");

        // Publish domain event
        eventBus.publish(DOWNLOAD_COMPLETED, {
            item: 'golded',
            source: 'BBS The Nexus',
        });

        // Check if download_software quest is complete
        const inventory = [...(gameState.player?.inventory || []), 'golded'];
        if (checkDownloadQuestCompletion(inventory, gameState.quests?.active)) {
            triggerQuest('download_software', gameState, dispatch, actions, appendOutput);
        }

        appendOutput("");
        appendOutput(BBS_FILES);
    }, 78);
    return { handled: true };
}

export function handleDownloadDoom({ dispatch, actions, appendOutput }) {
    appendOutput("Начинаю загрузку DOOM2.WAD...");
    appendOutput("Протокол: Zmodem");
    appendOutput("");
    simulateDownload("DOOM2.WAD", appendOutput, () => {
        dispatch(actions.addItem('doom2'));
        fs.createFile('C:\\GAMES\\DOOM2.WAD', '[DOOM 2 Game Data - INFECTED!]');
        appendOutput("");
        appendOutput("DOOM2.WAD установлен в C:\\GAMES\\DOOM2.WAD");
        appendOutput("");
        appendOutput(BBS_FILES);
    }, 800);
    return { handled: true };
}

export function handleDownloadAidstest({ dispatch, actions, appendOutput }) {
    appendOutput("Начинаю загрузку AIDSTEST v1.03...");
    appendOutput("Протокол: Zmodem");
    appendOutput("");
    simulateDownload("AIDSTEST.EXE", appendOutput, () => {
        dispatch(actions.addItem('aidstest'));
        fs.createFile('C:\\UTILS\\AIDSTEST.EXE', '[AIDSTEST v1.03 Antivirus]');
        appendOutput("");
        appendOutput("AIDSTEST установлен в C:\\UTILS\\AIDSTEST.EXE");
        appendOutput("");
        appendOutput(BBS_FILES);
    }, 42);
    return { handled: true };
}

export function handleDownloadBinkley({ dispatch, actions, appendOutput }) {
    appendOutput("Начинаю загрузку BinkleyTerm 2.60...");
    appendOutput("Протокол: Zmodem");
    appendOutput("");
    simulateDownload("BT260.EXE", appendOutput, () => {
        dispatch(actions.addItem('binkley'));
        fs.createFile('C:\\FIDO\\BINKLEY.EXE', '[BinkleyTerm 2.60 Executable]');
        fs.createFile('C:\\FIDO\\BT.CFG', `; BinkleyTerm Configuration
; Заполните поля ниже

SysopName 
Address 
BaudRate 
`);
        appendOutput("");
        appendOutput("BinkleyTerm установлен в C:\\FIDO\\BINKLEY.EXE");
        appendOutput("Конфиг: C:\\FIDO\\BT.CFG");

        // Publish domain event
        eventBus.publish(DOWNLOAD_COMPLETED, {
            item: 'binkley',
            source: 'BBS The Nexus',
        });

        // Quest handling logic for 'download_binkley' will be in listener.js (via DOWNLOAD_COMPLETED)
        // or check manually if we prefer. But ACT1 used triggerQuest here.
        // ACT4 quests are event-driven in listener.js, so we just publish.

        appendOutput("");
        appendOutput(BBS_FILES);
    }, 200);
    return { handled: true };
}

export function handleFilesQuit({ dispatch, actions, appendOutput }) {
    dispatch(actions.setTerminalMode('BBS_MENU'));
    appendOutput(BBS_MENU);
    return { handled: true };
}

export function handleUnknownFilesCommand({ appendOutput }) {
    appendOutput("Неверный выбор. Введите 1-5 или Q.");
    appendOutput("");
    appendOutput(BBS_FILES);
    return { handled: true };
}