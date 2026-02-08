import { DOWNLOAD_PROGRESS } from '../../assets/ascii';

/**
 * Simulate file download with progress
 * @param {string} filename - Name of file to download
 * @param {Function} appendOutput - Function to write to terminal
 * @param {Function} onComplete - Callback when download finishes
 * @param {number} size - Virtual size factor (approx time in ms per 5% chunk). Default 50.
 */
export function simulateDownload(filename, appendOutput, onComplete, size = 50) {
    const steps = [];
    for (let i = 0; i <= 100; i += 5) {
        steps.push(i);
    }
    
    let i = 0;
    // Interval = size gives roughly (size * 20) ms total duration
    // e.g. size 50 => 1000ms (1s)
    // size 500 => 10s
    const interval = Math.max(20, size); 

    const tick = () => {
        if (i < steps.length) {
            appendOutput(DOWNLOAD_PROGRESS(filename, steps[i]));
            i++;
            setTimeout(tick, interval);
        } else {
            appendOutput(`${filename} — загрузка завершена!`);
            onComplete();
        }
    };
    tick();
}
