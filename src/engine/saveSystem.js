import LZString from 'lz-string';
import { store } from './store';
import { 
    loadGameState, 
    loadPlayerState, 
    loadNetworkState, 
    loadQuestState 
} from './store';
import { loadState as loadWindowState } from './windowManager';

/**
 * Serialize current state to a compressed string
 */
export function saveGame() {
    const state = store.getState();
    try {
        const json = JSON.stringify(state);
        // Compress using LZString to reduce URL length significantly
        const compressed = LZString.compressToBase64(json);
        return `v1:${compressed}`;
    } catch (e) {
        console.error('Failed to save game:', e);
        return null;
    }
}

/**
 * Load game state from string (Supports legacy Base64 and new LZString)
 * @param {string} encoded 
 */
export function loadGame(encoded) {
    try {
        let json;

        // Check for version prefix
        if (encoded.startsWith('v1:')) {
            const data = encoded.substring(3);
            json = LZString.decompressFromBase64(data);
        } else {
            // Legacy: Plain Base64
            json = decodeURIComponent(atob(encoded));
        }

        if (!json) throw new Error('Decompression failed');

        const state = JSON.parse(json);

        // Validation: Check if essential slices exist
        if (!state.gameState || !state.player) {
            throw new Error('Invalid save data');
        }

        // Dispatch load actions for each slice
        store.dispatch(loadGameState(state.gameState));
        store.dispatch(loadPlayerState(state.player));
        store.dispatch(loadNetworkState(state.network));
        store.dispatch(loadQuestState(state.quests));
        store.dispatch(loadWindowState(state.windowManager));

        return true;
    } catch (e) {
        console.error('Failed to load game:', e);
        return false;
    }
}

/**
 * Generate shareable link
 */
export function getSaveLink() {
    const code = saveGame();
    if (!code) return null;
    
    const url = new URL(window.location.href);
    url.hash = `save=${code}`;
    return url.toString();
}

/**
 * Shorten URL using TinyURL (via CORS proxy)
 */
export async function shortenLink(longUrl) {
    try {
        // TinyURL API
        const api = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;
        // Use a public CORS proxy (corsproxy.io) to bypass browser restrictions
        const proxy = `https://corsproxy.io/?${encodeURIComponent(api)}`;
        
        const response = await fetch(proxy);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const shortUrl = await response.text();
        return shortUrl;
    } catch (e) {
        console.warn('Shortener failed, falling back to long URL', e);
        return longUrl;
    }
}
