import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    setSpeedrunMode, 
    setSpeedrunCommand, 
    resetGame,
    resetPlayer,
    resetNetwork,
    resetQuests,
    setOnboardingSeen
} from './store';
import { openWindow, closeWindow } from './windowManager';
import { WINDOW_DEFINITIONS } from '../config/windows';

const SPEEDRUN_SCRIPT = [
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

    // Step 11: Wait for close
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
    { type: 'wait', ms: 3000 }, // Wait for mail tossing animation (auto-triggered by config save)

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
    // We cannot simulate time passing easily without cheating or waiting long.
    // Assuming the user runs this at "night" or the game is fast.
    // For speedrun demo, we might need to close it.
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
    // Find "War" thread - assumes it exists in mock data
    // If not, we just write a new message to win.
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

export const SpeedrunEngine = () => {
    const dispatch = useDispatch();
    const gameState = useSelector(state => state.gameState);
    const speedrunMode = gameState?.speedrunMode || false;
    const speedrunCommand = gameState?.speedrunCommand || null;
    
    const [stepIndex, setStepIndex] = useState(0);
    const [waitingForCommand, setWaitingForCommand] = useState(false);
    const timeoutRef = useRef(null);

    // Debug logging
    useEffect(() => {
        if (speedrunMode) {
            console.log(`[Speedrun] Step: ${stepIndex}/${SPEEDRUN_SCRIPT.length}`);
        }
        if (gameState && !('speedrunMode' in gameState)) {
            console.error('[Speedrun] speedrunMode missing from gameState!', gameState);
        }
    }, [speedrunMode, stepIndex, gameState]);

    // Helpers
    const simulateTyping = (input, value) => {
        if (!input) return;
        input.focus();
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(input, value);
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
    };

    const simulateKeyPress = (key) => {
        const event = new KeyboardEvent('keydown', { key: key, bubbles: true });
        window.dispatchEvent(event);
    };

    const simulateClickText = (text) => {
        // Find all elements that might contain text
        const elements = Array.from(document.querySelectorAll('div, span, button, li'));
        const target = elements.find(el => 
            el.innerText && el.innerText.includes(text) && el.offsetParent !== null // visible
        );
        if (target) {
            target.click();
            console.log(`[Speedrun] Clicked text: "${text}"`);
        } else {
            console.warn(`[Speedrun] Text not found: "${text}"`);
        }
    };

    // Main execution loop
    useEffect(() => {
        if (!speedrunMode) {
            if (stepIndex !== 0) setTimeout(() => setStepIndex(0), 0);
            if (waitingForCommand) setTimeout(() => setWaitingForCommand(false), 0);
            return;
        }

        if (stepIndex >= SPEEDRUN_SCRIPT.length) {
            dispatch(setSpeedrunMode(false));
            return;
        }

        const step = SPEEDRUN_SCRIPT[stepIndex];

        if (waitingForCommand) return; 

        const executeStep = () => {
            if (step.type === 'wait') {
                timeoutRef.current = setTimeout(() => {
                    setStepIndex(prev => prev + 1);
                }, step.ms);
            } else if (step.type === 'fn') {
                step.action(dispatch);
                setStepIndex(prev => prev + 1);
            } else if (step.type === 'terminal') {
                dispatch(setSpeedrunCommand(step.command));
                setWaitingForCommand(true);
            } else if (step.type === 'fillForm') {
                const inputs = document.querySelectorAll('input[type="text"], textarea');
                if (inputs.length > 0) {
                    step.fields.forEach(field => {
                        if (inputs[field.index]) {
                            simulateTyping(inputs[field.index], field.value);
                        }
                    });
                    setTimeout(() => {
                        if (step.submitKey) simulateKeyPress(step.submitKey);
                        setStepIndex(prev => prev + 1);
                    }, 500);
                } else {
                    console.warn("Speedrun: Inputs not found for fillForm step");
                    setStepIndex(prev => prev + 1);
                }
            } else if (step.type === 'key') {
                simulateKeyPress(step.key);
                setStepIndex(prev => prev + 1);
            } else if (step.type === 'clickText') {
                simulateClickText(step.text);
                setStepIndex(prev => prev + 1);
            }
        };

        executeStep();

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [speedrunMode, stepIndex, waitingForCommand, dispatch]);

    // Command completion listener
    useEffect(() => {
        if (waitingForCommand && speedrunCommand === null) {
            setTimeout(() => {
                setWaitingForCommand(false);
                setStepIndex(prev => prev + 1);
            }, 0);
        }
    }, [speedrunCommand, waitingForCommand]);

    if (!speedrunMode) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: 'red',
            color: 'white',
            padding: '5px 10px',
            fontFamily: 'ms_sans_serif',
            zIndex: 10000,
            border: '2px solid white',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.5)'
        }}>
            SPEEDRUN MODE ACTIVE (Step {stepIndex}/{SPEEDRUN_SCRIPT.length})
            <button onClick={() => dispatch(setSpeedrunMode(false))} style={{ marginLeft: 10 }}>STOP</button>
        </div>
    );
};
