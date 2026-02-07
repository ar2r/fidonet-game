import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    setSpeedrunMode, 
    setSpeedrunCommand, 
    resetGame,
    resetPlayer,
    resetNetwork,
    resetQuests
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
    }},
    { type: 'wait', ms: 1000 },

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
    // Actually handleSave in ConfigEditor closes it after timeout.
    // So we wait for it to close.
    { type: 'wait', ms: 2000 },

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
    { type: 'wait', ms: 2000 },

    // Step 14: Wait for Mail Tossing Animation
    { type: 'wait', ms: 5000 },

    // Step 15: Open Map to show progress
    { type: 'fn', action: (dispatch) => dispatch(openWindow(WINDOW_DEFINITIONS['district-map'])) },
    { type: 'wait', ms: 2000 },
];

export const SpeedrunEngine = () => {
    const dispatch = useDispatch();
    const speedrunMode = useSelector(state => state.gameState.speedrunMode);
    const speedrunCommand = useSelector(state => state.gameState.speedrunCommand);
    
    const [stepIndex, setStepIndex] = useState(0);
    const [waitingForCommand, setWaitingForCommand] = useState(false);
    const timeoutRef = useRef(null);

    // Helper to simulate typing into input fields
    const simulateTyping = (input, value) => {
        if (!input) return;
        
        // Focus the input
        input.focus();
        
        // Set value using property descriptor to bypass React's value tracking
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(input, value);
        
        // Dispatch input event so React state updates
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
    };

    // Helper to simulate key press
    const simulateKeyPress = (key) => {
        const event = new KeyboardEvent('keydown', { key: key, bubbles: true });
        window.dispatchEvent(event);
    };

    // Main execution loop
    useEffect(() => {
        if (!speedrunMode) {
            // Reset state asynchronously to avoid linter warnings about sync updates in effect
            if (stepIndex !== 0) setTimeout(() => setStepIndex(0), 0);
            if (waitingForCommand) setTimeout(() => setWaitingForCommand(false), 0);
            return;
        }

        if (stepIndex >= SPEEDRUN_SCRIPT.length) {
            // End of script
            dispatch(setSpeedrunMode(false));
            return;
        }

        const step = SPEEDRUN_SCRIPT[stepIndex];

        if (waitingForCommand) return; // Wait for command to finish

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
                // Find visible inputs
                const inputs = document.querySelectorAll('input[type="text"]');
                if (inputs.length > 0) {
                    step.fields.forEach(field => {
                        if (inputs[field.index]) {
                            simulateTyping(inputs[field.index], field.value);
                        }
                    });
                    
                    // Submit form
                    setTimeout(() => {
                        simulateKeyPress(step.submitKey);
                        setStepIndex(prev => prev + 1);
                    }, 500);
                } else {
                    // Retry or skip if inputs not found (maybe window didn't open yet)
                    // For now, retry once or skip
                    console.warn("Speedrun: Inputs not found for fillForm step");
                    setStepIndex(prev => prev + 1);
                }
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
            // Command finished
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