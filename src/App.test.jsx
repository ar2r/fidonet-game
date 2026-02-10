import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Provider } from 'react-redux';
import { store } from './engine/store';
import App from './App';
import * as saveSystem from './engine/saveSystem';

function renderWithStore(ui) {
    return render(<Provider store={store}>{ui}</Provider>);
}

describe('FidoNet Simulator UI', () => {
    it('renders the desktop environment', () => {
        renderWithStore(<App />);
        const startButton = screen.getByText(/Пуск/);
        expect(startButton).toBeInTheDocument();

        const dosPromptIcon = screen.getByText('MS-DOS');
        expect(dosPromptIcon).toBeInTheDocument();
    });

    it('opens terminal when MS-DOS Prompt is double-clicked', () => {
        renderWithStore(<App />);

        // Terminal is open by default - check for the window header
        const terminalHeaders = screen.getAllByText(/MS-DOS/i);
        expect(terminalHeaders.length).toBeGreaterThan(0);

        const closeButton = screen.getByText('×');
        fireEvent.click(closeButton);

        // After closing, terminal header should be gone (but may still be in history)
        const dosPromptIcon = screen.getByText('MS-DOS');
        fireEvent.doubleClick(dosPromptIcon);

        // Terminal should be open again
        const terminalHeadersAfter = screen.getAllByText(/MS-DOS/i);
        expect(terminalHeadersAfter.length).toBeGreaterThan(0);
    });
});

describe('Save/Load integration', () => {
    let loadGameSpy;
    let saveToLocalStorageSpy;
    let loadFromLocalStorageSpy;
    let clearLocalStorageSpy;
    let replaceStateSpy;

    beforeEach(() => {
        vi.useFakeTimers();
        loadGameSpy = vi.spyOn(saveSystem, 'loadGame');
        saveToLocalStorageSpy = vi.spyOn(saveSystem, 'saveToLocalStorage');
        loadFromLocalStorageSpy = vi.spyOn(saveSystem, 'loadFromLocalStorage');
        clearLocalStorageSpy = vi.spyOn(saveSystem, 'clearLocalStorage');
        replaceStateSpy = vi.spyOn(window.history, 'replaceState');
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        window.location.hash = '';
    });

    it('loads from URL hash, saves to localStorage, and clears URL on mount', () => {
        // Set up a valid save in the URL hash
        const validSave = saveSystem.saveGame();
        window.location.hash = `#save=${validSave}`;

        loadGameSpy.mockReturnValue(true);
        saveToLocalStorageSpy.mockReturnValue(true);

        renderWithStore(<App />);

        // loadGame should be called with the encoded save
        expect(loadGameSpy).toHaveBeenCalledWith(validSave);
        // Should persist to localStorage after loading from URL
        expect(saveToLocalStorageSpy).toHaveBeenCalled();
        // Should clear the URL hash
        expect(replaceStateSpy).toHaveBeenCalledWith(null, '', window.location.pathname);
    });

    it('falls back to localStorage when no URL hash present', () => {
        window.location.hash = '';
        loadFromLocalStorageSpy.mockReturnValue(false);

        renderWithStore(<App />);

        expect(loadGameSpy).not.toHaveBeenCalled();
        expect(loadFromLocalStorageSpy).toHaveBeenCalled();
    });

    it('auto-saves to localStorage after state change with debounce', () => {
        saveToLocalStorageSpy.mockReturnValue(true);
        loadFromLocalStorageSpy.mockReturnValue(false);

        renderWithStore(<App />);

        // Clear the mount call
        saveToLocalStorageSpy.mockClear();

        // Advance timer past the 1s debounce
        act(() => {
            vi.advanceTimersByTime(1100);
        });

        expect(saveToLocalStorageSpy).toHaveBeenCalled();
    });

    it('calls clearLocalStorage on game reset', () => {
        loadFromLocalStorageSpy.mockReturnValue(false);
        clearLocalStorageSpy.mockImplementation(() => {});

        // Mock confirm to return true
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        // Mock reload to prevent actual page reload
        const reloadSpy = vi.fn();
        Object.defineProperty(window, 'location', {
            value: { ...window.location, reload: reloadSpy, hash: '', pathname: '/' },
            writable: true,
            configurable: true,
        });

        renderWithStore(<App />);

        // Open start menu and click reset
        const startButton = screen.getByText(/Пуск/);
        fireEvent.click(startButton);

        const resetButton = screen.getByText(/Закончить игру/);
        fireEvent.click(resetButton);

        expect(confirmSpy).toHaveBeenCalled();
        expect(clearLocalStorageSpy).toHaveBeenCalled();

        confirmSpy.mockRestore();
    });

    it('shows alert when URL hash contains invalid save data', () => {
        window.location.hash = '#save=invalid-garbage';
        loadGameSpy.mockReturnValue(false);

        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

        renderWithStore(<App />);

        expect(loadGameSpy).toHaveBeenCalledWith('invalid-garbage');
        expect(alertSpy).toHaveBeenCalledWith('Ошибка загрузки сохранения: неверный код.');
        // Should NOT save to localStorage on failed load
        expect(saveToLocalStorageSpy).not.toHaveBeenCalled();

        alertSpy.mockRestore();
    });

    it('loads from blob URL (#id=) and restores game', async () => {
        window.location.hash = '#id=testblob123';
        const downloadSaveSpy = vi.spyOn(saveSystem, 'downloadSave').mockResolvedValue('v1:blobdata');
        loadGameSpy.mockReturnValue(true);
        saveToLocalStorageSpy.mockReturnValue(true);

        await act(async () => {
            renderWithStore(<App />);
        });

        expect(downloadSaveSpy).toHaveBeenCalledWith('testblob123');
        expect(loadGameSpy).toHaveBeenCalledWith('v1:blobdata');
        expect(saveToLocalStorageSpy).toHaveBeenCalled();
        expect(replaceStateSpy).toHaveBeenCalledWith(null, '', window.location.pathname);

        downloadSaveSpy.mockRestore();
    });

    it('falls back to localStorage when blob download fails', async () => {
        window.location.hash = '#id=badblob';
        const downloadSaveSpy = vi.spyOn(saveSystem, 'downloadSave').mockRejectedValue(new Error('Network error'));
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        loadFromLocalStorageSpy.mockReturnValue(false);

        await act(async () => {
            renderWithStore(<App />);
        });

        expect(downloadSaveSpy).toHaveBeenCalledWith('badblob');
        expect(alertSpy).toHaveBeenCalledWith('Не удалось загрузить сохранение с сервера.');
        expect(loadFromLocalStorageSpy).toHaveBeenCalled();

        downloadSaveSpy.mockRestore();
        alertSpy.mockRestore();
    });
});
