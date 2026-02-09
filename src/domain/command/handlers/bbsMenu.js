/**
 * BBS Menu Mode Handlers
 * Commands available in BBS main menu
 */

import { BBS_MENU, BBS_FILES, BBS_CHAT_SYSOP } from '../../../assets/ascii';
import { startChat } from './bbsChat';

/**
 * Handle 'F' - Enter file area
 */
export function handleFilesCommand({ dispatch, actions, appendOutput }) {
    dispatch(actions.setTerminalMode('BBS_FILES'));
    appendOutput(BBS_FILES);
    return { handled: true };
}

/**
 * Handle 'M' - Message area (not implemented yet)
 */
export function handleMessageCommand({ appendOutput }) {
    appendOutput("═══════════════════════════════════════");
    appendOutput("  ОБЛАСТЬ СООБЩЕНИЙ");
    appendOutput("═══════════════════════════════════════");
    appendOutput("");
    appendOutput("Эта область пока недоступна.");
    appendOutput("Вы сможете читать эхопочту после настройки GoldED.");
    appendOutput("");
    appendOutput(BBS_MENU);
    return { handled: true };
}

/**
 * Handle 'C' - Chat with SysOp
 */
export function handleChatCommand({ dispatch, actions, appendOutput, gameState }) {
    dispatch(actions.setTerminalMode('BBS_CHAT'));
    appendOutput(BBS_CHAT_SYSOP);
    
    // Immediately start the chat dialogue
    startChat({ gameState, dispatch, actions, appendOutput });
    
    return { handled: true };
}

/**
 * Handle 'G' - Goodbye (disconnect)
 */
export function handleGoodbyeCommand({ dispatch, actions, appendOutput }) {
    dispatch(actions.disconnect());
    dispatch(actions.setTerminalMode('IDLE'));
    appendOutput("");
    appendOutput("До свидания!");
    appendOutput("NO CARRIER");
    appendOutput("");
    return { handled: true };
}

/**
 * Handle unknown command in BBS menu
 */
export function handleUnknownBBSCommand({ appendOutput }) {
    appendOutput("Неверный выбор. Используйте F, M, C или G.");
    appendOutput("");
    appendOutput(BBS_MENU);
    return { handled: true };
}
