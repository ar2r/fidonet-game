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

        const terminalWindow = screen.getByText(/Terminal.exe/i);
        expect(terminalWindow).toBeInTheDocument();

        const closeButton = screen.getByText('X');
        fireEvent.click(closeButton);
        expect(screen.queryByText(/Terminal.exe/i)).not.toBeInTheDocument();

        const fidoIcon = screen.getByText('Fido.bat');
        fireEvent.doubleClick(fidoIcon);

        expect(screen.getByText(/Terminal.exe/i)).toBeInTheDocument();
    });
});
