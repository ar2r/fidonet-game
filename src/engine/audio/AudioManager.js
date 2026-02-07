/**
 * Audio Manager
 * Synthesizes retro sounds using Web Audio API
 */

import { eventBus } from '../../domain/events/bus';
import { 
    MODEM_DIALING, 
    MODEM_CONNECTED, 
    DOWNLOAD_STARTED, 
    DOWNLOAD_COMPLETED,
    MESSAGE_POSTED,
    ITEM_BOUGHT
} from '../../domain/events/types';

class AudioManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.initialized = false;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.toggleMute = this.toggleMute.bind(this);
        this.playTone = this.playTone.bind(this);
    }

    init() {
        if (this.initialized) return;
        
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
            this.setupListeners();
            console.log('Audio System Initialized');
        } catch (e) {
            console.error('Web Audio API not supported', e);
        }
    }

    setupListeners() {
        eventBus.subscribe(MODEM_DIALING, () => this.playDialSequence());
        eventBus.subscribe(MODEM_CONNECTED, () => this.playHandshake());
        eventBus.subscribe(DOWNLOAD_STARTED, () => this.playBeep(800, 0.1));
        eventBus.subscribe(DOWNLOAD_COMPLETED, () => this.playSuccessTune());
        eventBus.subscribe(MESSAGE_POSTED, () => this.playBeep(400, 0.05));
        eventBus.subscribe(ITEM_BOUGHT, () => this.playChaChing());
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    playTone(freq, duration, type = 'sine', startTime = 0) {
        if (this.muted || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime + startTime;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.start(now);
        osc.stop(now + duration);
    }

    playDTMF(char) {
        if (this.muted || !this.ctx) return;
        // DTMF Frequencies (simplified)
        const freqs = {
            '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
            '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
            '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
            '0': [941, 1336], '*': [941, 1209], '#': [941, 1477]
        };

        const pair = freqs[char] || freqs['1'];
        const now = this.ctx.currentTime;
        const duration = 0.1;

        pair.forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.value = f;
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            gain.gain.value = 0.1;
            osc.start(now);
            osc.stop(now + duration);
        });
    }

    playDialSequence() {
        const number = '5553389';
        let delay = 0;
        for (let char of number) {
            setTimeout(() => this.playDTMF(char), delay * 1000);
            delay += 0.15;
        }
    }

    playHandshake() {
        if (this.muted || !this.ctx) return;
        const now = this.ctx.currentTime;
        
        // Carrier tone
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(2100, now);
        osc.frequency.linearRampToValueAtTime(2400, now + 1); // V.34 preamble
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        gain.gain.value = 0.05;
        
        osc.start(now);
        osc.stop(now + 2.5);

        // Noise burst (simulated by FM modulation for now to save tokens/complexity)
        const noise = this.ctx.createOscillator();
        noise.type = 'sawtooth';
        noise.frequency.value = 50;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.value = 500;
        
        noise.connect(osc.frequency); // Modulate frequency to create "noise"
        noise.start(now + 1);
        noise.stop(now + 2);
    }

    playBeep(freq = 440, duration = 0.1) {
        this.playTone(freq, duration, 'square');
    }

    playSuccessTune() {
        this.playTone(523.25, 0.1, 'square', 0);
        this.playTone(659.25, 0.1, 'square', 0.1);
        this.playTone(783.99, 0.2, 'square', 0.2);
    }

    playChaChing() {
        this.playTone(800, 0.1, 'sine', 0);
        this.playTone(1200, 0.3, 'sine', 0.1);
    }
    
    // For UI click feedback
    playClick() {
        this.playTone(200, 0.05, 'triangle');
    }
}

export const audioManager = new AudioManager();
