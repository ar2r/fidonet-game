import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    saveGame,
    loadGame,
    getSaveLink,
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
} from './saveSystem';

// Mock localStorage for environments where it's not available
function createMockLocalStorage() {
    const store = {};
    return {
        getItem: vi.fn((key) => store[key] ?? null),
        setItem: vi.fn((key, value) => { store[key] = String(value); }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    };
}

describe('saveSystem', () => {
    describe('saveGame / loadGame roundtrip', () => {
        it('saves and loads game state correctly', () => {
            const encoded = saveGame();
            expect(encoded).toBeTruthy();
            expect(encoded.startsWith('v1:')).toBe(true);

            const result = loadGame(encoded);
            expect(result).toBe(true);
        });
    });

    describe('loadGame with invalid data', () => {
        it('returns false for empty string', () => {
            expect(loadGame('')).toBe(false);
        });

        it('returns false for garbage data', () => {
            expect(loadGame('v1:not-valid-compressed-data!!!')).toBe(false);
        });

        it('returns false for valid base64 but invalid JSON', () => {
            expect(loadGame(btoa('not json'))).toBe(false);
        });

        it('returns false for JSON missing required slices', () => {
            const json = JSON.stringify({ foo: 'bar' });
            const encoded = btoa(encodeURIComponent(json));
            expect(loadGame(encoded)).toBe(false);
        });
    });

    describe('getSaveLink', () => {
        it('returns a URL with #save= hash', () => {
            const link = getSaveLink();
            expect(link).toBeTruthy();
            expect(link).toContain('#save=v1:');
        });
    });

    describe('localStorage functions', () => {
        let mockStorage;
        let originalLocalStorage;

        beforeEach(() => {
            mockStorage = createMockLocalStorage();
            originalLocalStorage = globalThis.localStorage;
            Object.defineProperty(globalThis, 'localStorage', {
                value: mockStorage,
                writable: true,
                configurable: true,
            });
        });

        afterEach(() => {
            Object.defineProperty(globalThis, 'localStorage', {
                value: originalLocalStorage,
                writable: true,
                configurable: true,
            });
        });

        it('saveToLocalStorage writes to localStorage', () => {
            const result = saveToLocalStorage();
            expect(result).toBe(true);
            expect(mockStorage.setItem).toHaveBeenCalledWith('fidonet_save', expect.stringMatching(/^v1:/));
        });

        it('loadFromLocalStorage restores saved state', () => {
            // First save so there's data to load
            saveToLocalStorage();
            const savedValue = mockStorage.setItem.mock.calls[0][1];
            mockStorage.getItem.mockReturnValue(savedValue);

            const result = loadFromLocalStorage();
            expect(result).toBe(true);
            expect(mockStorage.getItem).toHaveBeenCalledWith('fidonet_save');
        });

        it('loadFromLocalStorage returns false when no save exists', () => {
            mockStorage.getItem.mockReturnValue(null);
            const result = loadFromLocalStorage();
            expect(result).toBe(false);
        });

        it('clearLocalStorage removes the save', () => {
            clearLocalStorage();
            expect(mockStorage.removeItem).toHaveBeenCalledWith('fidonet_save');
        });

        it('saveToLocalStorage handles localStorage errors gracefully', () => {
            mockStorage.setItem.mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            const result = saveToLocalStorage();
            expect(result).toBe(false);
        });

        it('loadFromLocalStorage handles localStorage errors gracefully', () => {
            mockStorage.getItem.mockImplementation(() => {
                throw new Error('SecurityError');
            });

            const result = loadFromLocalStorage();
            expect(result).toBe(false);
        });

        it('loadFromLocalStorage returns false for corrupted data in localStorage', () => {
            mockStorage.getItem.mockReturnValue('v1:corrupted-garbage!!!');
            const result = loadFromLocalStorage();
            expect(result).toBe(false);
        });

        it('clearLocalStorage handles errors gracefully', () => {
            mockStorage.removeItem.mockImplementation(() => {
                throw new Error('SecurityError');
            });
            // Should not throw
            expect(() => clearLocalStorage()).not.toThrow();
        });

        it('saveToLocalStorage returns false when saveGame returns null', () => {
            // saveGame() serializes the store, it should always work,
            // but we test the null guard by mocking JSON.stringify to fail
            const spy = vi.spyOn(JSON, 'stringify').mockImplementation(() => {
                throw new Error('circular');
            });

            const result = saveToLocalStorage();
            expect(result).toBe(false);
            expect(mockStorage.setItem).not.toHaveBeenCalled();

            spy.mockRestore();
        });

        it('saveToLocalStorage + loadFromLocalStorage full roundtrip via mock', () => {
            // Save
            saveToLocalStorage();
            expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
            const key = mockStorage.setItem.mock.calls[0][0];
            const value = mockStorage.setItem.mock.calls[0][1];

            expect(key).toBe('fidonet_save');

            // Load with same value
            mockStorage.getItem.mockReturnValue(value);
            const result = loadFromLocalStorage();
            expect(result).toBe(true);
        });
    });
});
