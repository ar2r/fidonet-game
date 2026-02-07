import '@testing-library/jest-dom';

// JSDOM doesn't implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function () { };

// Mock Web Audio API
window.AudioContext = class AudioContext {
    constructor() {
        this.state = 'running';
    }
    createOscillator() {
        return {
            connect: () => {},
            start: () => {},
            stop: () => {},
            type: 'sine',
            frequency: { value: 440, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} }
        };
    }
    createGain() {
        return {
            connect: () => {},
            gain: { value: 1, setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }
        };
    }
    suspend() { this.state = 'suspended'; }
    resume() { this.state = 'running'; }
    get currentTime() { return 0; }
    get destination() { return {}; }
};
window.webkitAudioContext = window.AudioContext;
