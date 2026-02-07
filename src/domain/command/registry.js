/**
 * Command Registry
 * Central registry for command handlers by terminal mode
 */

import { TerminalMode } from './types';

class CommandRegistry {
    constructor() {
        // Mode -> Map<command, handler>
        this.handlers = new Map();

        // Initialize empty handler maps for each mode
        Object.values(TerminalMode).forEach(mode => {
            this.handlers.set(mode, new Map());
        });

        // Global handlers (work in any mode)
        this.globalHandlers = new Map();
    }

    /**
     * Register a command handler for specific mode
     * @param {string} mode - Terminal mode
     * @param {string|RegExp} pattern - Command pattern (string or regex)
     * @param {Function} handler - Handler function
     */
    register(mode, pattern, handler) {
        const modeHandlers = this.handlers.get(mode);
        if (!modeHandlers) {
            throw new Error(`Unknown terminal mode: ${mode}`);
        }

        modeHandlers.set(pattern, handler);
    }

    /**
     * Register a global handler (works in any mode)
     * @param {string|RegExp} pattern - Command pattern
     * @param {Function} handler - Handler function
     */
    registerGlobal(pattern, handler) {
        this.globalHandlers.set(pattern, handler);
    }

    /**
     * Find and execute handler for command
     * @param {string} mode - Current terminal mode
     * @param {string} command - Command string
     * @param {Object} context - Command context
     * @returns {*} Handler result or null if not found
     */
    execute(mode, command, context) {
        const normalizedCommand = command.toUpperCase().trim();

        // Try global handlers first
        const globalResult = this._tryHandlers(this.globalHandlers, normalizedCommand, context);
        if (globalResult !== null) {
            return globalResult;
        }

        // Try mode-specific handlers
        const modeHandlers = this.handlers.get(mode);
        if (modeHandlers) {
            const modeResult = this._tryHandlers(modeHandlers, normalizedCommand, context);
            if (modeResult !== null) {
                return modeResult;
            }
        }

        return null; // No handler found
    }

    /**
     * Try handlers from a map
     * @private
     */
    _tryHandlers(handlersMap, command, context) {
        for (const [pattern, handler] of handlersMap) {
            if (typeof pattern === 'string') {
                // Exact match
                if (command === pattern || command.startsWith(pattern + ' ')) {
                    return handler(context);
                }
            } else if (pattern instanceof RegExp) {
                // Regex match
                if (pattern.test(command)) {
                    return handler(context);
                }
            }
        }
        return null;
    }

    /**
     * Get all registered commands for a mode
     * @param {string} mode - Terminal mode
     * @returns {Array<string|RegExp>}
     */
    getCommands(mode) {
        const modeHandlers = this.handlers.get(mode);
        if (!modeHandlers) return [];

        return Array.from(modeHandlers.keys());
    }

    /**
     * Get handler count
     * @returns {Object} Count by mode
     */
    getStats() {
        const stats = {
            global: this.globalHandlers.size,
        };

        for (const [mode, handlers] of this.handlers) {
            stats[mode] = handlers.size;
        }

        return stats;
    }
}

// Export singleton instance
export const commandRegistry = new CommandRegistry();

// Also export class for testing
export { CommandRegistry };
