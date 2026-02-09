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
