/**
 * BBS Chat Mode Handler
 * Any input returns to BBS menu
 */

import { BBS_MENU } from '../../../assets/ascii';

/**
 * Handle any command in chat mode
 * Returns to BBS menu
 */
export function handleChatInput({ dispatch, actions, appendOutput }) {
    dispatch(actions.setTerminalMode('BBS_MENU'));
    appendOutput("");
    appendOutput("Сисоп отключился.");
    appendOutput("");
    appendOutput(BBS_MENU);
    return { handled: true };
}
