import { DOWNLOAD_PROGRESS } from '../../assets/ascii';

/**
 * Simulate file download with progress
 * @param {string} filename - Name of file to download
 * @param {Function} appendOutput - Function to write to terminal
 * @param {Function} onComplete - Callback when download finishes
 */
export function simulateDownload(filename, appendOutput, onComplete) {
    const steps = [0, 10, 25, 40, 55, 70, 85, 100];
    let i = 0;
    const tick = () => {
        if (i < steps.length) {
            appendOutput(DOWNLOAD_PROGRESS(filename, steps[i]));
            i++;
            setTimeout(tick, 300);
        } else {
            appendOutput(`${filename} — загрузка завершена!`);
            onComplete();
        }
    };
    tick();
}
