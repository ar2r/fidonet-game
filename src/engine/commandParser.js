import fs from './fileSystemInstance';
import { commandRegistry } from '../domain/command/registry';
import * as idle from '../domain/command/handlers/idle';
import * as network from '../domain/command/handlers/network';
import * as apps from '../domain/command/handlers/apps';
import * as bbsFiles from '../domain/command/handlers/bbsFiles';
import * as bbsMenu from '../domain/command/handlers/bbsMenu';
import * as bbsChat from '../domain/command/handlers/bbsChat';
import { getTimeCost, computeTickEffects } from './gameTick';
import { checkRandomEvents } from '../domain/events/random/scheduler';

// --- Registration ---

// Clear existing handlers to support HMR (Hot Module Replacement)
['IDLE', 'BBS_MENU', 'BBS_FILES', 'BBS_CHAT'].forEach(mode => {
    const handlers = commandRegistry.handlers.get(mode);
    if (handlers) handlers.clear();
});

// IDLE Mode Handlers
commandRegistry.register('IDLE', 'DIR', idle.handleDir);
commandRegistry.register('IDLE', 'LS', idle.handleDir);
commandRegistry.register('IDLE', /^CD(\\.*)?$/, idle.handleCd); // Matches CD, CD\, CD\PATH
commandRegistry.register('IDLE', /^CD(\s+.*)?$/, idle.handleCd); // Matches CD PATH
commandRegistry.register('IDLE', 'TYPE', idle.handleType);
commandRegistry.register('IDLE', 'CAT', idle.handleType);
commandRegistry.register('IDLE', 'VER', idle.handleVer);
commandRegistry.register('IDLE', 'DATE', idle.handleDate);
commandRegistry.register('IDLE', 'TIME', idle.handleTime);
commandRegistry.register('IDLE', 'TREE', idle.handleTree);
commandRegistry.register('IDLE', 'CLS', idle.handleCls);
commandRegistry.register('IDLE', 'CLEAR', idle.handleCls);
commandRegistry.register('IDLE', 'HELP', idle.handleHelp);
commandRegistry.register('IDLE', 'MANUAL', idle.handleHelp);
commandRegistry.register('IDLE', 'HINT', idle.handleHint);
commandRegistry.register('IDLE', 'QUEST', idle.handleHint);

// Network / Modem (IDLE mode)
commandRegistry.register('IDLE', 'TERMINAL', network.handleTerminal);
commandRegistry.register('IDLE', 'TERMINAL.EXE', network.handleTerminal);
commandRegistry.register('IDLE', 'EXIT', network.handleExit);
commandRegistry.register('IDLE', 'QUIT', network.handleExit);
commandRegistry.register('IDLE', 'ATZ', network.handleAtz);
commandRegistry.register('IDLE', 'AT&F', network.handleAtz);
commandRegistry.register('IDLE', /^ATDT.*$/, network.handleDial);
commandRegistry.register('IDLE', /^ATDP.*$/, network.handleDial);
commandRegistry.register('IDLE', /^DIAL.*$/, network.handleDial);

// Apps (IDLE mode)
commandRegistry.register('IDLE', 'DOOM2', apps.handleDoom);
commandRegistry.register('IDLE', 'DOOM2.WAD', apps.handleDoom);
commandRegistry.register('IDLE', 'AIDSTEST', apps.handleAidstest);
commandRegistry.register('IDLE', 'AIDSTEST.EXE', apps.handleAidstest);
commandRegistry.register('IDLE', 'T-MAIL', apps.handleTMail);
commandRegistry.register('IDLE', 'T-MAIL.EXE', apps.handleTMail);
commandRegistry.register('IDLE', 'POLL', apps.handleTMail);
commandRegistry.register('IDLE', 'WORK', apps.handleWork);
commandRegistry.register('IDLE', 'ALLOWANCE', apps.handleAllowance);

// BBS_MENU Mode
commandRegistry.register('BBS_MENU', 'F', bbsMenu.handleFilesCommand);
commandRegistry.register('BBS_MENU', 'M', bbsMenu.handleMessageCommand);
commandRegistry.register('BBS_MENU', 'C', bbsMenu.handleChatCommand);
commandRegistry.register('BBS_MENU', 'G', bbsMenu.handleGoodbyeCommand);
commandRegistry.register('BBS_MENU', /.*/, bbsMenu.handleUnknownBBSCommand); // Catch-all

// BBS_FILES Mode
commandRegistry.register('BBS_FILES', '1', bbsFiles.handleDownloadTMail);
commandRegistry.register('BBS_FILES', '2', bbsFiles.handleDownloadGoldED);
commandRegistry.register('BBS_FILES', '3', bbsFiles.handleDownloadDoom);
commandRegistry.register('BBS_FILES', '4', bbsFiles.handleDownloadAidstest);
commandRegistry.register('BBS_FILES', 'Q', bbsFiles.handleFilesQuit);
commandRegistry.register('BBS_FILES', /.*/, bbsFiles.handleUnknownFilesCommand); // Catch-all

// BBS_CHAT Mode
commandRegistry.register('BBS_CHAT', /.*/, bbsChat.handleChatInput); // Catch-all

// --- Exports ---

export function getPrompt() {
    return fs.promptPath();
}

export const processCommand = (cmd, gameState, dispatch, actions, appendOutput) => {
    const command = cmd.trim(); // Keep original case for arguments, handlers will uppercase logic
    const terminalMode = gameState.network?.terminalMode || 'IDLE';

    // Special case for empty command
    if (command === '') return;

    const context = {
        gameState,
        dispatch,
        actions,
        appendOutput,
        command // Pass full command string for argument parsing
    };

    const result = commandRegistry.execute(terminalMode, command, context);

    if (result && result.handled) {
        // --- Game Loop: Time & Events ---
        
        // 1. Calculate Time Cost
        const cost = getTimeCost(command);
        
        // 2. Advance Time
        // Note: actions should include setTimeMinutes, advanceTime, setPhase, setZMH, advanceDay
        // We need to ensure 'actions' object passed to processCommand has these.
        // Assuming 'actions' comes from mapDispatchToProps or similar in App.jsx.
        
        const currentMinutes = gameState.gameState?.timeMinutes || 1380;
        const isConnected = gameState.network?.connected || false;
        
        const effects = computeTickEffects(currentMinutes, cost, isConnected);
        
        if (effects.newMinutes !== currentMinutes) {
            dispatch(actions.setTimeMinutes(effects.newMinutes));
            dispatch(actions.advanceTime(effects.newTimeString));
            
            if (effects.newPhase !== gameState.gameState.phase) {
                dispatch(actions.setPhase(effects.newPhase));
            }
            
            if (effects.newZMH !== gameState.gameState.zmh) {
                dispatch(actions.setZMH(effects.newZMH));
            }
            
            if (effects.daysAdvanced > 0) {
                dispatch(actions.advanceDay(effects.daysAdvanced));
            }
            
            if (effects.momPatienceDelta !== 0) {
                dispatch(actions.updateStat({ stat: 'momsPatience', value: effects.momPatienceDelta }));
            }
        }

        // 3. Random Events
        checkRandomEvents(gameState, dispatch, actions, appendOutput);

        if (result.output === 'CLEAR') return 'CLEAR';
        return;
    }

    // Default fallback for IDLE mode (Unknown command)
    if (terminalMode === 'IDLE') {
        appendOutput("Неверная команда или имя файла");
    }
};
