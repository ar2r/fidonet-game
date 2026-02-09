/**
 * Tech Tools Handlers
 * TRACE, PING, etc.
 */

import { eventBus } from '../../events/bus';
import { COMMAND_EXECUTED } from '../../events/types';

export function handleTrace({ command, appendOutput }) {
    const parts = command.trim().split(/\s+/);
    const target = parts.length > 1 ? parts[1].toUpperCase() : '';

    if (!target) {
        appendOutput("Usage: TRACE <username|address>");
        return { handled: true };
    }

    appendOutput(`Tracing route to ${target}...`);
    
    // Simulation
    setTimeout(() => {
        appendOutput(` 1  2:5020/730 (MyNode)  0ms`);
        setTimeout(() => {
            appendOutput(` 2  2:5020/123 (The Nexus)  20ms`);
            setTimeout(() => {
                if (target === 'TROLL.MASTER.SU') {
                    appendOutput(` 3  2:5020/666 (DarkSide)  45ms`);
                    appendOutput(`Target found! Address: 2:5020/666`);
                    appendOutput("Log saved to disk.");

                    // Publish event for quest completion
                    eventBus.publish(COMMAND_EXECUTED, {
                        command: 'TRACE',
                        args: 'TROLL.MASTER.SU',
                        success: true
                    });
                } else {
                    appendOutput(` 3  * * * Request timed out.`);
                    appendOutput(`Trace complete.`);
                }
            }, 800);
        }, 800);
    }, 500);

    return { handled: true };
}
