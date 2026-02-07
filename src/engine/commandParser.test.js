import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processCommand } from './commandParser';

describe('commandParser', () => {
    let dispatch;
    let actions;
    let output;
    let appendOutput;
    let baseState;

    beforeEach(() => {
        dispatch = vi.fn();
        output = [];
        appendOutput = (text) => output.push(text);
        actions = {
            connect: vi.fn((payload) => ({ type: 'network/connect', payload })),
            initializeModem: vi.fn(() => ({ type: 'network/initializeModem' })),
            setTerminalMode: vi.fn((payload) => ({ type: 'network/setTerminalMode', payload })),
            setTerminalProgram: vi.fn((payload) => ({ type: 'network/setTerminalProgram', payload })),
            completeQuest: vi.fn((payload) => ({ type: 'quests/completeQuest', payload })),
            addItem: vi.fn((payload) => ({ type: 'player/addItem', payload })),
            setTimeMinutes: vi.fn((payload) => ({ type: 'gameState/setTimeMinutes', payload })),
            advanceTime: vi.fn((payload) => ({ type: 'gameState/advanceTime', payload })),
            setPhase: vi.fn((payload) => ({ type: 'gameState/setPhase', payload })),
            setZMH: vi.fn((payload) => ({ type: 'gameState/setZMH', payload })),
            advanceDay: vi.fn((payload) => ({ type: 'gameState/advanceDay', payload })),
            updateStat: vi.fn((payload) => ({ type: 'player/updateStat', payload })),
            setVirusActive: vi.fn((payload) => ({ type: 'gameState/setVirusActive', payload })),
            setVirusStage: vi.fn((payload) => ({ type: 'gameState/setVirusStage', payload })),
            disconnect: vi.fn(() => ({ type: 'network/disconnect' })),
        };
        baseState = {
            gameState: { day: 1, phase: 'night', time: '23:00', zmh: false, virusActive: false },
            network: { connected: false, modemInitialized: false, terminalMode: 'IDLE', terminalProgramRunning: false },
            player: { 
                inventory: [],
                stats: { atmosphere: 100, sanity: 100 } 
            },
            quests: { active: 'get_online', completed: [] },
        };
    });

    describe('IDLE mode', () => {
        it('TERMINAL.EXE launches terminal program', () => {
            processCommand('TERMINAL', baseState, dispatch, actions, appendOutput);
            expect(output.some(l => l.includes('TERMINAL v3.14'))).toBe(true);
        });

        it('ATZ requires TERMINAL.EXE to be running', () => {
            processCommand('ATZ', baseState, dispatch, actions, appendOutput);
            expect(output.some(l => l.includes('TERMINAL.EXE'))).toBe(true);
        });

        it('ATZ initializes modem when in TERMINAL', () => {
            baseState.network.terminalProgramRunning = true;
            processCommand('ATZ', baseState, dispatch, actions, appendOutput);
            expect(dispatch).toHaveBeenCalled();
            expect(output).toContain('OK');
        });

        it('AT&F initializes modem when in TERMINAL', () => {
            baseState.network.terminalProgramRunning = true;
            processCommand('AT&F', baseState, dispatch, actions, appendOutput);
            expect(dispatch).toHaveBeenCalled();
            expect(output).toContain('OK');
        });

        it('CLS returns CLEAR', () => {
            const result = processCommand('CLS', baseState, dispatch, actions, appendOutput);
            expect(result).toBe('CLEAR');
        });

        it('HELP shows manual', () => {
            processCommand('HELP', baseState, dispatch, actions, appendOutput);
            expect(output.length).toBeGreaterThan(0);
            expect(output[0]).toContain('СИМУЛЯТОР ФИДОНЕТ');
        });

        it('DIAL requires TERMINAL.EXE to be running', () => {
            processCommand('DIAL 555-3389', baseState, dispatch, actions, appendOutput);
            expect(output.some(l => l.includes('TERMINAL.EXE'))).toBe(true);
        });

        it('DIAL without modem init shows error when in TERMINAL', () => {
            baseState.network.terminalProgramRunning = true;
            processCommand('DIAL 555-3389', baseState, dispatch, actions, appendOutput);
            expect(output.some(l => l.includes('не инициализирован'))).toBe(true);
        });

        it('VER shows DOS version', () => {
            processCommand('VER', baseState, dispatch, actions, appendOutput);
            expect(output).toContain('MS-DOS Version 6.22');
        });

        it('unknown command shows error', () => {
            processCommand('FOOBAR', baseState, dispatch, actions, appendOutput);
            expect(output).toContain('Неверная команда или имя файла');
        });

        it('empty command does nothing', () => {
            processCommand('', baseState, dispatch, actions, appendOutput);
            expect(output).toHaveLength(0);
        });

        it('EXIT when not connected says so', () => {
            processCommand('EXIT', baseState, dispatch, actions, appendOutput);
            expect(output.some(l => l.includes('Нет активного соединения'))).toBe(true);
        });

        it('EXIT when connected disconnects', () => {
            baseState.network.connected = true;
            processCommand('EXIT', baseState, dispatch, actions, appendOutput);
            expect(dispatch).toHaveBeenCalled();
            expect(output.some(l => l.includes('NO CARRIER'))).toBe(true);
        });
    });

    describe('BBS_MENU mode', () => {
        beforeEach(() => {
            baseState.network.terminalMode = 'BBS_MENU';
            baseState.network.connected = true;
        });

        it('F enters file area', () => {
            processCommand('F', baseState, dispatch, actions, appendOutput);
            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'network/setTerminalMode' }));
        });

        it('M shows mail unavailable', () => {
            processCommand('M', baseState, dispatch, actions, appendOutput);
            expect(output.some(l => l.includes('недоступна'))).toBe(true);
        });

        it('C enters chat', () => {
            processCommand('C', baseState, dispatch, actions, appendOutput);
            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'network/setTerminalMode' }));
            expect(output.some(l => l.includes('Архитектор'))).toBe(true);
        });

        it('G disconnects', () => {
            processCommand('G', baseState, dispatch, actions, appendOutput);
            expect(dispatch).toHaveBeenCalled();
            expect(output.some(l => l.includes('NO CARRIER'))).toBe(true);
        });

        it('invalid choice shows error', () => {
            processCommand('X', baseState, dispatch, actions, appendOutput);
            expect(output.some(l => l.includes('Неверный выбор'))).toBe(true);
        });
    });

    describe('BBS_FILES mode', () => {
        beforeEach(() => {
            baseState.network.terminalMode = 'BBS_FILES';
            baseState.network.connected = true;
        });

        it('1 starts T-Mail download', () => {
            processCommand('1', baseState, dispatch, actions, appendOutput);
            expect(output.some(l => l.includes('T-Mail'))).toBe(true);
        });

        it('2 starts GoldED download', () => {
            processCommand('2', baseState, dispatch, actions, appendOutput);
            expect(output.some(l => l.includes('GoldED'))).toBe(true);
        });

        it('3 downloads DOOM2.WAD (virus)', () => {
            processCommand('3', baseState, dispatch, actions, appendOutput);
            expect(output.some(l => l.includes('DOOM2.WAD'))).toBe(true);
        });

        it('Q returns to menu', () => {
            processCommand('Q', baseState, dispatch, actions, appendOutput);
            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'network/setTerminalMode' }));
        });

        it('invalid choice shows error', () => {
            processCommand('Z', baseState, dispatch, actions, appendOutput);
            expect(output.some(l => l.includes('Неверный выбор'))).toBe(true);
        });
    });

    describe('BBS_CHAT mode', () => {
        it('any input returns to menu', () => {
            baseState.network.terminalMode = 'BBS_CHAT';
            processCommand('hello', baseState, dispatch, actions, appendOutput);
            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'network/setTerminalMode' }));
        });
    });
});
