import { WINDOW_DEFINITIONS } from '../config/windows';
import { 
    resetGame,
    resetPlayer,
    resetNetwork,
    resetQuests,
    setOnboardingSeen
} from './store';
import { openWindow, closeWindow } from './windowManager';

export const SPEEDRUN_SCRIPT = [
    // Initial State
    { type: 'fn', action: (dispatch) => {
        dispatch(resetGame());
        dispatch(resetPlayer());
        dispatch(resetNetwork());
        dispatch(resetQuests());
        dispatch(setOnboardingSeen());
    }},
    { type: 'wait', ms: 1000 },

    // --- ACT 1 & 2 ---

    // Step 1: Open Terminal
    { type: 'fn', action: (dispatch) => dispatch(openWindow(WINDOW_DEFINITIONS.terminal)) },
    { type: 'wait', ms: 1500 },

    // Step 2: Init Modem
    { type: 'terminal', command: 'ATZ' },
    { type: 'wait', ms: 2000 },

    // Step 3: Dial BBS
    { type: 'terminal', command: 'DIAL 555-3389' },
    { type: 'wait', ms: 5000 }, // Wait for connection animation

    // Step 4: Check Files
    { type: 'terminal', command: 'FILES' },
    { type: 'wait', ms: 2000 },

    // Step 5: Download T-Mail
    { type: 'terminal', command: 'DOWNLOAD T-MAIL' },
    { type: 'wait', ms: 4000 },

    // Step 6: Download GoldED
    { type: 'terminal', command: 'DOWNLOAD GOLDED' },
    { type: 'wait', ms: 4000 },

    // Step 7: Disconnect
    { type: 'terminal', command: 'EXIT' },
    { type: 'wait', ms: 2000 },

    // Step 8: Close Terminal
    { type: 'fn', action: (dispatch) => dispatch(closeWindow('terminal')) },
    { type: 'wait', ms: 1000 },

    // Step 9: Open T-Mail Config
    { type: 'fn', action: (dispatch) => dispatch(openWindow(WINDOW_DEFINITIONS['tmail-config'])) },
    { type: 'wait', ms: 1500 },

    // Step 10: Fill T-Mail Config
    { 
        type: 'fillForm', 
        windowId: 'tmail-config',
        fields: [
            { index: 0, value: '2:5020/730.15' }, // Address
            { index: 1, value: 'secret' },        // Password
            { index: 2, value: '2:5020/730' },    // Boss Node
            { index: 3, value: '555-3389' }       // Boss Phone
        ],
        submitKey: 'F2'
    },
    { type: 'wait', ms: 2000 },

    // Step 11: Close T-Mail Config (it closes automatically on save, but just in case)
    { type: 'wait', ms: 1000 },

    // Step 12: Open GoldED Config
    { type: 'fn', action: (dispatch) => dispatch(openWindow(WINDOW_DEFINITIONS['golded-config'])) },
    { type: 'wait', ms: 1500 },

    // Step 13: Fill GoldED Config
    { 
        type: 'fillForm', 
        windowId: 'golded-config',
        fields: [
            { index: 0, value: 'SysOp' },         // Username
            { index: 1, value: 'Fido User' },     // Realname
            { index: 2, value: '2:5020/730.15' }, // Address
            { index: 3, value: 'My BBS' }         // Origin
        ],
        submitKey: 'F2'
    },
    { type: 'wait', ms: 3000 }, // Wait for mail tossing animation

    // --- ACT 3 ---

    // Step 16: Poll Boss
    { type: 'fn', action: (dispatch) => dispatch(openWindow(WINDOW_DEFINITIONS.terminal)) },
    { type: 'wait', ms: 1500 },
    { type: 'terminal', command: 'T-MAIL POLL' },
    { type: 'wait', ms: 5000 }, // Wait for tossing animation
    { type: 'fn', action: (dispatch) => dispatch(closeWindow('terminal')) },
    { type: 'wait', ms: 1000 },

    // Step 17: Read Rules
    { type: 'fn', action: (dispatch) => dispatch(openWindow(WINDOW_DEFINITIONS['golded-reader'])) },
    { type: 'wait', ms: 1500 },
    { type: 'clickText', text: 'SU.FLAME' }, // Select Area
    { type: 'wait', ms: 1000 },
    { type: 'key', key: 'Enter' }, // Enter Area
    { type: 'wait', ms: 1000 },
    { type: 'clickText', text: 'Rules' }, // Select Message
    { type: 'wait', ms: 1000 },
    { type: 'key', key: 'Enter' }, // Read Message
    { type: 'wait', ms: 2000 }, // Reading...
    { type: 'key', key: 'Escape' }, // Back to list
    { type: 'wait', ms: 1000 },

    // Step 18: Write Hello (Diplomat)
    { type: 'key', key: 'n' }, // New Message
    { type: 'wait', ms: 1000 },
    { 
        type: 'fillForm', 
        fields: [
            { index: 0, value: 'All' },   // To
            { index: 1, value: 'Hello' }, // Subj
            { index: 2, value: 'Hello everyone! Peace and love.' } // Body
        ]
    },
    { type: 'wait', ms: 1000 },
    { type: 'clickText', text: 'Send (Ctrl+Enter)' }, // Click Send button
    { type: 'wait', ms: 1500 },
    { type: 'fn', action: (dispatch) => dispatch(closeWindow('golded-reader')) },
    { type: 'wait', ms: 1000 },

    // --- ACT 4 ---

    // Step 19: Buy Modem
    { type: 'fn', action: (dispatch) => dispatch(openWindow(WINDOW_DEFINITIONS['radio-market'])) },
    { type: 'wait', ms: 1500 },
    { type: 'clickText', text: 'US Robotics' }, // Select Modem
    { type: 'wait', ms: 1000 },
    { type: 'key', key: 'Enter' }, // Buy
    { type: 'wait', ms: 1000 },
    { type: 'fn', action: (dispatch) => dispatch(closeWindow('radio-market')) },
    { type: 'wait', ms: 1000 },

    // Step 20: Request Node
    { type: 'fn', action: (dispatch) => dispatch(openWindow(WINDOW_DEFINITIONS.terminal)) },
    { type: 'wait', ms: 1500 },
    { type: 'terminal', command: 'ATZ' }, // Init new modem
    { type: 'wait', ms: 1000 },
    { type: 'terminal', command: 'DIAL 555-3389' },
    { type: 'wait', ms: 4000 },
    { type: 'terminal', command: 'CHAT' }, // Enter Chat
    { type: 'wait', ms: 2000 },
    // Dialogue: 1. Hello -> 1. Request Node -> 1. Yes -> 1. Thanks
    { type: 'terminal', command: '1' },
    { type: 'wait', ms: 1500 },
    { type: 'terminal', command: '1' },
    { type: 'wait', ms: 1500 },
    { type: 'terminal', command: '1' },
    { type: 'wait', ms: 1500 },
    { type: 'terminal', command: '1' },
    { type: 'wait', ms: 2000 },
    
    // Step 21: Download Binkley
    { type: 'terminal', command: 'FILES' }, // Go to Files
    { type: 'wait', ms: 2000 },
    { type: 'terminal', command: 'DOWNLOAD BINKLEY' }, // Download
    { type: 'wait', ms: 4000 },
    { type: 'terminal', command: 'EXIT' },
    { type: 'wait', ms: 2000 },
    { type: 'fn', action: (dispatch) => dispatch(closeWindow('terminal')) },
    { type: 'wait', ms: 1000 },

    // Step 22: Configure Binkley
    { type: 'fn', action: (dispatch) => dispatch(openWindow(WINDOW_DEFINITIONS['binkley-config'])) },
    { type: 'wait', ms: 1500 },
    { 
        type: 'fillForm', 
        fields: [
            { index: 0, value: 'SysOp' },         // Sysop
            { index: 1, value: '2:5020/730' },    // Address
            { index: 2, value: '19200' },         // Baud
            { index: 3, value: 'COM2' },          // Port
            { index: 4, value: 'C:\\FIDO\\IN' },  // Inbound
            { index: 5, value: 'C:\\FIDO\\OUT' }  // Outbound
        ],
        submitKey: 'F2'
    },
    { type: 'wait', ms: 2000 },

    // Step 23: Nightly Uptime
    { type: 'fn', action: (dispatch) => dispatch(openWindow(WINDOW_DEFINITIONS['binkley-term'])) },
    { type: 'wait', ms: 5000 }, // Wait for ZMH check (simulated)
    { type: 'fn', action: (dispatch) => dispatch(closeWindow('binkley-term')) },
    { type: 'wait', ms: 1000 },

    // --- ACT 5 ---
    
    // Step 24: Crisis (Diplomat)
    { type: 'fn', action: (dispatch) => dispatch(openWindow(WINDOW_DEFINITIONS['golded-reader'])) },
    { type: 'wait', ms: 1500 },
    { type: 'clickText', text: 'SU.FLAME' }, // Enter Area
    { type: 'wait', ms: 1000 },
    { type: 'key', key: 'Enter' },
    { type: 'wait', ms: 1000 },
    { type: 'key', key: 'n' },
    { type: 'wait', ms: 1000 },
    { 
        type: 'fillForm', 
        fields: [
            { index: 0, value: 'All' },
            { index: 1, value: 'Peace' },
            { index: 2, value: 'Stop the war!' }
        ]
    },
    { type: 'wait', ms: 1000 },
    { type: 'clickText', text: 'Send (Ctrl+Enter)' },
    { type: 'wait', ms: 1500 },
    { type: 'fn', action: (dispatch) => dispatch(closeWindow('golded-reader')) },
    { type: 'wait', ms: 1000 },

    // --- ACT 6 ---

    // Step 25: Meet Coordinator
    { type: 'fn', action: (dispatch) => dispatch(openWindow(WINDOW_DEFINITIONS.terminal)) },
    { type: 'wait', ms: 1500 },
    { type: 'terminal', command: 'ATZ' },
    { type: 'wait', ms: 1000 },
    { type: 'terminal', command: 'DIAL 555-3389' },
    { type: 'wait', ms: 4000 },
    { type: 'terminal', command: 'CHAT' },
    { type: 'wait', ms: 2000 },
    // Coordinator Dialogue
    { type: 'terminal', command: '1' },
    { type: 'wait', ms: 1500 },
    { type: 'terminal', command: '1' },
    { type: 'wait', ms: 1500 },
    { type: 'terminal', command: '1' }, // "I agree"
    { type: 'wait', ms: 3000 },

    // End
    { type: 'fn', action: (dispatch) => dispatch(openWindow(WINDOW_DEFINITIONS['district-map'])) },
];