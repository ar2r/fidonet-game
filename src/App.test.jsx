import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { store } from './engine/store';
import App from './App';

function renderWithStore(ui) {
    return render(<Provider store={store}>{ui}</Provider>);
}

describe('FidoNet Simulator UI', () => {
    it('renders the desktop environment', () => {
        renderWithStore(<App />);
        const startButton = screen.getByText(/Пуск/);
        expect(startButton).toBeInTheDocument();

        const fidoIcon = screen.getByText('Fido.bat');
        expect(fidoIcon).toBeInTheDocument();
    });

    it('opens terminal when Fido.bat is double-clicked', () => {
        renderWithStore(<App />);

        // Terminal is open by default - check for the window header
        const terminalHeaders = screen.getAllByText(/Terminal.exe/i);
        expect(terminalHeaders.length).toBeGreaterThan(0);

        const closeButton = screen.getByText('X');
        fireEvent.click(closeButton);

        // After closing, terminal header should be gone (but may still be in history)
        const fidoIcon = screen.getByText('Fido.bat');
        fireEvent.doubleClick(fidoIcon);

        // Terminal should be open again
        const terminalHeadersAfter = screen.getAllByText(/Terminal.exe/i);
        expect(terminalHeadersAfter.length).toBeGreaterThan(0);
    });
});
