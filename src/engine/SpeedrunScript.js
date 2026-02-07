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

    // Start Terminal Program
    { type: 'terminal', command: 'TERMINAL' },
    { type: 'wait', ms: 1000 },

    // Step 2: Init Modem
    { type: 'terminal', command: 'ATZ' },
    { type: 'wait', ms: 2000 },

    // Step 3: Dial BBS
    { type: 'terminal', command: 'DIAL 555-3389' },
    { type: 'wait', ms: 5000 }, // Wait for connection animation

    // Step 4: Check Files
    { type: 'terminal', command: 'F' }, // Enter File Area
    { type: 'wait', ms: 2000 },

    // Step 5: Download T-Mail
    { type: 'terminal', command: '1' }, // Download File #1 (T-Mail)
    { type: 'wait', ms: 4000 },

    // Step 6: Download GoldED
    { type: 'terminal', command: '2' }, // Download File #2 (GoldED)
    { type: 'wait', ms: 4000 },

    // Step 7: Disconnect
    { type: 'terminal', command: 'G' }, // Goodbye/Exit from File Area (or back to menu then exit?)
    // If '1' and '2' return to file list, we need to exit file area first?
    // Let's assume 'G' works globally or we need 'Q' (Quit) then 'G'.
    // Checking previous script: it used 'EXIT'.
    // If we are in BBS, 'EXIT' might not work if it expects 'G'.
    // Let's assume we need to go back to main menu.
    // If '1' downloads and stays in file menu:
    // We probably need 'R' (Return) or 'Q' (Quit) to main menu?
    // Let's verify via tool if possible, or just try 'Q' then 'G'.
    // For now, I'll update to 'F', '1', '2'.
    // And for disconnect, if 'EXIT' failed, likely we need 'G' (Goodbye) from Main Menu.
    // If we are in File Menu, maybe 'M' (Main)?
    // I'll try `type: 'terminal', command: 'Q' ` (Quit Files) -> `type: 'terminal', command: 'G' ` (Goodbye).
    
    // Step 7: Disconnect
    { type: 'terminal', command: 'Q' }, // Quit Files to Main Menu
    { type: 'wait', ms: 1000 },
    { type: 'terminal', command: 'G' }, // Goodbye (Hangup)
    { type: 'wait', ms: 2000 },
    
    // ...
    
    // Also in Step 21 (Act 4 Download Binkley):
    // It says `FILES` and `DOWNLOAD BINKLEY`.
    // Should be `F` and `5` (assuming Binkley is #5).
    
    // Step 21: Download Binkley
    { type: 'terminal', command: 'F' }, // Go to Files
    { type: 'wait', ms: 2000 },
    { type: 'terminal', command: '5' }, // Download Binkley (File 5)
    { type: 'wait', ms: 4000 },
    { type: 'terminal', command: 'Q' }, // Quit Files
    { type: 'wait', ms: 1000 },
    { type: 'terminal', command: 'G' }, // Goodbye
    { type: 'wait', ms: 2000 },
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
    { type: 'terminal', command: 'TERMINAL' },
    { type: 'wait', ms: 1000 },
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
    { type: 'terminal', command: 'F' }, // Go to Files
    { type: 'wait', ms: 2000 },
    { type: 'terminal', command: '5' }, // Download Binkley (File #5)
    { type: 'wait', ms: 4000 },
    { type: 'terminal', command: 'Q' }, // Quit Files to Menu
    { type: 'wait', ms: 1000 },
    { type: 'terminal', command: 'G' }, // Goodbye
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
    { type: 'terminal', command: 'TERMINAL' },
    { type: 'wait', ms: 1000 },
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