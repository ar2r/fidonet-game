import { store } from './store';
import { 
    loadGameState, 
    loadPlayerState, 
    loadNetworkState, 
    loadQuestState 
} from './store'; // Assuming we export them
import { loadState as loadWindowState } from './windowManager';

/**
 * Serialize current state to a Base64 string
 */
export function saveGame() {
    const state = store.getState();
    try {
        const json = JSON.stringify(state);
        // Using Base64. encodeURIComponent handles Unicode (e.g. Russian text)
        const encoded = btoa(encodeURIComponent(json));
        return encoded;
    } catch (e) {
        console.error('Failed to save game:', e);
        return null;
    }
}

/**
 * Load game state from Base64 string
 * @param {string} encoded 
 */
export function loadGame(encoded) {
    try {
        const json = decodeURIComponent(atob(encoded));
        const state = JSON.parse(json);

        // Validation: Check if essential slices exist
        if (!state.gameState || !state.player) {
            throw new Error('Invalid save data');
        }

        // Dispatch load actions for each slice
        // We use a batch update ideally, but sequential dispatch is fine for now
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
