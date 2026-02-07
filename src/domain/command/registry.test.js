import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommandRegistry } from './registry';
import { TerminalMode } from './types';

describe('CommandRegistry', () => {
    let registry;

    beforeEach(() => {
        registry = new CommandRegistry();
    });

    describe('register and execute', () => {
        it('registers and executes command for specific mode', () => {
            const handler = vi.fn(() => ({ result: 'success' }));
            const context = { command: 'TEST', normalizedCommand: 'TEST' };

            registry.register(TerminalMode.IDLE, 'TEST', handler);
            const result = registry.execute(TerminalMode.IDLE, 'test', context);

            expect(handler).toHaveBeenCalledWith(context);
            expect(result).toEqual({ result: 'success' });
        });

        it('does not execute command in wrong mode', () => {
            const handler = vi.fn();
            const context = { command: 'TEST' };

            registry.register(TerminalMode.IDLE, 'TEST', handler);
            const result = registry.execute(TerminalMode.BBS_MENU, 'test', context);

            expect(handler).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('handles regex patterns', () => {
            const handler = vi.fn(() => ({ result: 'success' }));
            const context = { command: 'DIR C:\\' };

            registry.register(TerminalMode.IDLE, /^DIR/, handler);
            const result = registry.execute(TerminalMode.IDLE, 'dir c:\\', context);

            expect(handler).toHaveBeenCalled();
            expect(result).toEqual({ result: 'success' });
        });

        it('handles commands with arguments', () => {
            const handler = vi.fn(() => ({ result: 'success' }));
            const context = { command: 'TYPE FILE.TXT' };

            registry.register(TerminalMode.IDLE, 'TYPE', handler);
            const result = registry.execute(TerminalMode.IDLE, 'type file.txt', context);

            expect(handler).toHaveBeenCalled();
            expect(result).toEqual({ result: 'success' });
        });
    });

    describe('global handlers', () => {
        it('executes global handlers in any mode', () => {
            const handler = vi.fn(() => ({ result: 'global' }));
            const context = { command: 'HELP' };

            registry.registerGlobal('HELP', handler);

            // Should work in any mode
            expect(registry.execute(TerminalMode.IDLE, 'help', context)).toEqual({ result: 'global' });
            expect(registry.execute(TerminalMode.BBS_MENU, 'help', context)).toEqual({ result: 'global' });
            expect(registry.execute(TerminalMode.BBS_FILES, 'help', context)).toEqual({ result: 'global' });
        });

        it('prefers global handlers over mode handlers', () => {
            const globalHandler = vi.fn(() => ({ from: 'global' }));
            const modeHandler = vi.fn(() => ({ from: 'mode' }));
            const context = { command: 'CLS' };

            registry.registerGlobal('CLS', globalHandler);
            registry.register(TerminalMode.IDLE, 'CLS', modeHandler);

            const result = registry.execute(TerminalMode.IDLE, 'cls', context);

            expect(globalHandler).toHaveBeenCalled();
            expect(modeHandler).not.toHaveBeenCalled();
            expect(result).toEqual({ from: 'global' });
        });
    });

    describe('getCommands', () => {
        it('returns registered commands for mode', () => {
            registry.register(TerminalMode.IDLE, 'DIR', vi.fn());
            registry.register(TerminalMode.IDLE, 'TYPE', vi.fn());
            registry.register(TerminalMode.BBS_MENU, 'F', vi.fn());

            const idleCommands = registry.getCommands(TerminalMode.IDLE);
            expect(idleCommands).toContain('DIR');
            expect(idleCommands).toContain('TYPE');
            expect(idleCommands).not.toContain('F');
        });

        it('returns empty array for mode with no commands', () => {
            const commands = registry.getCommands(TerminalMode.IDLE);
            expect(commands).toEqual([]);
        });
    });

    describe('getStats', () => {
        it('returns handler counts by mode', () => {
            registry.registerGlobal('HELP', vi.fn());
            registry.registerGlobal('CLS', vi.fn());
            registry.register(TerminalMode.IDLE, 'DIR', vi.fn());
            registry.register(TerminalMode.BBS_MENU, 'F', vi.fn());
            registry.register(TerminalMode.BBS_MENU, 'M', vi.fn());

            const stats = registry.getStats();

            expect(stats.global).toBe(2);
            expect(stats[TerminalMode.IDLE]).toBe(1);
            expect(stats[TerminalMode.BBS_MENU]).toBe(2);
            expect(stats[TerminalMode.BBS_FILES]).toBe(0);
        });
    });

    describe('error handling', () => {
        it('throws error for unknown mode', () => {
            expect(() => {
                registry.register('UNKNOWN_MODE', 'TEST', vi.fn());
            }).toThrow('Unknown terminal mode');
        });
    });
});
