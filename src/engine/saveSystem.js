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

const STORAGE_KEY = 'fidonet_save';

/**
 * Save game state to localStorage
 */
export function saveToLocalStorage() {
    try {
        const encoded = saveGame();
        if (encoded) {
            localStorage.setItem(STORAGE_KEY, encoded);
            return true;
        }
        return false;
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
        return false;
    }
}

/**
 * Load game state from localStorage
 */
export function loadFromLocalStorage() {
    try {
        const encoded = localStorage.getItem(STORAGE_KEY);
        if (!encoded) return false;
        return loadGame(encoded);
    } catch (e) {
        console.warn('Failed to load from localStorage:', e);
        return false;
    }
}

/**
 * Clear saved game from localStorage
 */
export function clearLocalStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.warn('Failed to clear localStorage:', e);
    }
}

const JSONBLOB_API = 'https://jsonblob.com/api/jsonBlob';

/**
 * Parse URL hash to determine save type
 * @param {string} hash - window.location.hash
 * @returns {{ type: 'blob', id: string } | { type: 'inline', data: string } | null}
 */
export function parseShareHash(hash) {
    if (!hash) return null;
    if (hash.startsWith('#id=')) {
        const id = hash.substring(4);
        return id ? { type: 'blob', id } : null;
    }
    if (hash.startsWith('#save=')) {
        const data = hash.substring(6);
        return data ? { type: 'inline', data } : null;
    }
    return null;
}

/**
 * Upload save string to jsonblob.com
 * @param {string} saveString - compressed save data
 * @returns {Promise<string>} blob ID
 */
export async function uploadSave(saveString) {
    const response = await fetch(JSONBLOB_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ s: saveString }),
    });
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
    const location = response.headers.get('Location');
    if (!location) throw new Error('No Location header in response');
    // Location is like https://jsonblob.com/api/jsonBlob/<id>
    const id = location.split('/').pop();
    return id;
}

/**
 * Download save string from jsonblob.com by blob ID
 * @param {string} blobId
 * @returns {Promise<string>} save string
 */
export async function downloadSave(blobId) {
    const response = await fetch(`${JSONBLOB_API}/${blobId}`, {
        headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const data = await response.json();
    if (!data.s) throw new Error('Invalid blob data: missing save field');
    return data.s;
}

/**
 * Create a shareable link: upload to jsonblob for short URL, fall back to long #save= URL
 * @returns {Promise<{ url: string, isShort: boolean }>}
 */
export async function createShareLink() {
    const code = saveGame();
    if (!code) return { url: null, isShort: false };

    try {
        const blobId = await uploadSave(code);
        const url = new URL(window.location.href);
        url.hash = `id=${blobId}`;
        return { url: url.toString(), isShort: true };
    } catch (e) {
        console.warn('jsonblob upload failed, using long URL:', e);
        const url = new URL(window.location.href);
        url.hash = `save=${code}`;
        return { url: url.toString(), isShort: false };
    }
}
