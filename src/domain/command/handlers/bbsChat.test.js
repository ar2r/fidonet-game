import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleChatInput } from './bbsChat';

describe('bbsChat Handler', () => {
    let dispatch;
    let actions;
    let output;
    let appendOutput;
    let gameState;

    beforeEach(() => {
        dispatch = vi.fn();
        output = [];
        appendOutput = (text) => output.push(text);
        actions = {
            setTerminalMode: vi.fn((payload) => ({ type: 'network/setTerminalMode', payload })),
            setDialogue: vi.fn((payload) => ({ type: 'network/setDialogue', payload })),
        };
        gameState = {
            network: { activeDialogue: null, dialogueStep: 0 },
            quests: { active: 'none' },
        };
    });

    describe('Initialization', () => {
        it('shows busy message and hint if active quest is hardware_upgrade', () => {
            gameState.quests.active = 'hardware_upgrade';
            
            handleChatInput({ command: 'HELLO', gameState, dispatch, actions, appendOutput });

            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ 
                type: 'network/setTerminalMode', 
                payload: 'BBS_MENU' 
            }));
            expect(output.some(l => l.includes('Архитектор сейчас занят'))).toBe(true);
            expect(output.some(l => l.includes('Подсказка: Сначала выполните квест'))).toBe(true);
        });

        it('starts dialogue if active quest is request_node', () => {
            gameState.quests.active = 'request_node';
            
            handleChatInput({ command: 'HELLO', gameState, dispatch, actions, appendOutput });

            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ 
                type: 'network/setDialogue', 
                payload: { id: 'request_node_status', step: 0 } 
            }));
            expect(output.some(l => l.includes('привело тебя в Нексус'))).toBe(true);
        });

        it('fast-forwards if command matches first step option', () => {
            gameState.quests.active = 'request_node';
            
            // "хочу свою ноду" matches option 1 in step 0, which goes to step 2
            handleChatInput({ command: 'хочу свою ноду', gameState, dispatch, actions, appendOutput });

            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ 
                type: 'network/setDialogue', 
                payload: { id: 'request_node_status', step: 2 } 
            }));
            // Should show Step 2 text
            expect(output.some(l => l.includes('ответственность'))).toBe(true);
        });
    });

    describe('Option Selection', () => {
        beforeEach(() => {
            gameState.network.activeDialogue = 'request_node_status';
            gameState.network.dialogueStep = 0;
        });

        it('accepts numeric input', () => {
            handleChatInput({ command: '1', gameState, dispatch, actions, appendOutput });

            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ 
                type: 'network/setDialogue',
                payload: { id: 'request_node_status', step: 2 } // Option 1 nextStep is 2
            }));
        });

        it('accepts text input (fuzzy match)', () => {
            handleChatInput({ command: 'за место', gameState, dispatch, actions, appendOutput });

            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ 
                type: 'network/setDialogue',
                payload: { id: 'request_node_status', step: 1 } // Option 2 nextStep is 1
            }));
        });

        it('accepts text input case insensitive and exits', () => {
            handleChatInput({ command: 'МИМО ПРОХОДИЛ', gameState, dispatch, actions, appendOutput });

            // Should exit immediately (Option 3 nextStep is 'exit')
            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ 
                type: 'network/setDialogue',
                payload: { id: null, step: 0 } 
            }));
            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
                type: 'network/setTerminalMode',
                payload: 'BBS_MENU'
            }));
        });

        it('shows error on invalid input', () => {
            handleChatInput({ command: 'foobar', gameState, dispatch, actions, appendOutput });

            expect(dispatch).not.toHaveBeenCalled();
            expect(output.some(l => l.includes('Непонятно'))).toBe(true);
        });
    });
});
