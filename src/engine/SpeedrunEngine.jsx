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
import { WINDOW_DEFINITIONS } from '../App'; // Need to export this or redefine

// Helper to access window definitions (assuming they are static or we duplicate for now)
// Ideally App.jsx should export this, but let's redefine minimal needed or move to a shared constant file.
// For now, I'll rely on string IDs which windowManager uses.

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
    { type: 'fn', action: (dispatch) => dispatch(openWindow({ 
        id: 'terminal', 
        title: 'MS-DOS Prompt - C:', 
        component: 'terminal', 
        position: { x: 100, y: 100 }, 
        size: { width: 640, height: 480 } 
    })) },
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
    { type: 'fn', action: (dispatch) => dispatch(openWindow({
        id: 'tmail-config',
        title: 'T-Mail Setup',
        component: 'tmail-config',
        position: { x: 200, y: 100 },
        size: { width: 600, height: 500 },
    })) },
    { type: 'wait', ms: 3000 },

    // Step 10: Open Map
    { type: 'fn', action: (dispatch) => dispatch(openWindow({
        id: 'district-map',
        title: 'Карта района: путь игрока',
        component: 'district-map',
        position: { x: 120, y: 60 },
        size: { width: 980, height: 640 },
    })) },
    { type: 'wait', ms: 2000 },
];

export const SpeedrunEngine = () => {
    const dispatch = useDispatch();
    const speedrunMode = useSelector(state => state.gameState.speedrunMode);
    const speedrunCommand = useSelector(state => state.gameState.speedrunCommand);
    
    const [stepIndex, setStepIndex] = useState(0);
    const [waitingForCommand, setWaitingForCommand] = useState(false);
    const timeoutRef = useRef(null);

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
