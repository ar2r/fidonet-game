/**
 * Domain Event Types
 * All events that can occur in the game world
 */

// Command events
export const COMMAND_EXECUTED = 'command.executed';

// Connection events
export const BBS_CONNECTED = 'bbs.connected';
export const BBS_DISCONNECTED = 'bbs.disconnected';

// Download events
export const DOWNLOAD_STARTED = 'download.started';
export const DOWNLOAD_COMPLETED = 'download.completed';

// File events
export const FILE_SAVED = 'file.saved';
export const FILE_OPENED = 'file.opened';

// Program events
export const PROGRAM_OPENED = 'program.opened';
export const PROGRAM_CLOSED = 'program.closed';

// Time events
export const TIME_ADVANCED = 'time.advanced';
export const DAY_CHANGED = 'day.changed';
export const PHASE_CHANGED = 'phase.changed';

// Virus events
export const VIRUS_INFECTED = 'virus.infected';
export const VIRUS_CLEANED = 'virus.cleaned';

// Quest events
export const QUEST_STARTED = 'quest.started';
export const QUEST_COMPLETED = 'quest.completed';
export const QUEST_STEP_COMPLETED = 'quest.step.completed';

// Modem events
export const MODEM_INITIALIZED = 'modem.initialized';
export const MODEM_DIALING = 'modem.dialing';
export const MODEM_CONNECTED = 'modem.connected';

// Mail/Tossing events
export const UI_START_MAIL_TOSSING = 'ui.start.mail.tossing';
export const MAIL_TOSSING_COMPLETED = 'mail.tossed';
export const MESSAGE_READ = 'message.read';
export const MESSAGE_POSTED = 'message.posted';

// Random events
export const MOM_PICKUP = 'event.random.mom_pickup';

// Economy events
export const ITEM_BOUGHT = 'economy.item.bought';

// Dialogue events
export const DIALOGUE_COMPLETED = 'dialogue.completed';

// ZMH events
export const ZMH_ACTIVITY_COMPLETED = 'zmh.activity.completed';

/**
 * Event payload interfaces (JSDoc for documentation)
 *
 * @typedef {Object} CommandExecutedEvent
 * @property {string} command - The executed command
 * @property {string} mode - Terminal mode (IDLE, BBS_MENU, etc.)
 * @property {number} timestamp - When command was executed
 *
 * @typedef {Object} FileSavedEvent
 * @property {string} path - File path
 * @property {string} content - File content
 * @property {number} timestamp
 *
 * @typedef {Object} DownloadCompletedEvent
 * @property {string} item - Downloaded item ID (e.g., 't-mail', 'golded')
 * @property {string} source - Download source (e.g., 'BBS The Nexus')
 * @property {number} timestamp
 *
 * @typedef {Object} BBSConnectedEvent
 * @property {string} bbs - BBS name
 * @property {string} phone - Phone number
 * @property {number} timestamp
 *
 * @typedef {Object} TimeAdvancedEvent
 * @property {number} delta - Minutes advanced
 * @property {string} newTime - New time string
 * @property {number} timestamp
 */