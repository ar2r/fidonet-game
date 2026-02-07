import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    setSpeedrunMode, 
    setSpeedrunCommand,
} from './store';
import { SPEEDRUN_SCRIPT as DEFAULT_SCRIPT } from './SpeedrunScript';

export const SpeedrunEngine = ({ script = DEFAULT_SCRIPT }) => {
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
            console.log(`[Speedrun] Step: ${stepIndex}/${script.length}`);
        }
        if (gameState && !('speedrunMode' in gameState)) {
            console.error('[Speedrun] speedrunMode missing from gameState!', gameState);
        }
    }, [speedrunMode, stepIndex, gameState, script]);

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

        if (stepIndex >= script.length) {
            dispatch(setSpeedrunMode(false));
            return;
        }

        const step = script[stepIndex];

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
    }, [speedrunMode, stepIndex, waitingForCommand, dispatch, script]);

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
            SPEEDRUN MODE ACTIVE (Step {stepIndex}/{script.length})
            <button onClick={() => dispatch(setSpeedrunMode(false))} style={{ marginLeft: 10 }}>STOP</button>
        </div>
    );
};
