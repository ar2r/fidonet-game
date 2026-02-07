/**
 * Command Handler Types
 * Common types and interfaces for command handlers
 */

/**
 * Terminal modes
 */
export const TerminalMode = {
    IDLE: 'IDLE',
    BBS_MENU: 'BBS_MENU',
    BBS_FILES: 'BBS_FILES',
    BBS_CHAT: 'BBS_CHAT',
};

/**
 * Command handler result
 * @typedef {Object} CommandResult
 * @property {string[]} [output] - Lines to output to terminal
 * @property {Object[]} [statePatches] - Redux state patches to apply
 * @property {Object[]} [events] - Domain events to publish
 * @property {string} [signal] - Special signal (CLEAR, EXIT, etc.)
 * @property {boolean} [handled] - Whether command was handled
 */

/**
 * Command handler context
 * @typedef {Object} CommandContext
 * @property {string} command - Raw command string
 * @property {string} normalizedCommand - Normalized command (uppercase, trimmed)
 * @property {Object} gameState - Current game state
 * @property {Function} dispatch - Redux dispatch
 * @property {Object} actions - Redux actions
 * @property {Function} appendOutput - Function to append output
 * @property {Object} fileSystem - FileSystem instance
 */

/**
 * Command handler function
 * @callback CommandHandler
 * @param {CommandContext} context - Handler context
 * @returns {CommandResult|null} Result or null if not handled
 */
