import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('FidoNet Simulator UI', () => {
    it('renders the desktop environment', () => {
        render(<App />);
        // Check for the Start button
        const startButton = screen.getByRole('button', { name: /start/i });
        expect(startButton).toBeInTheDocument();

        // Check for the "Fido.bat" icon (using text matching as it's a span)
        const fidoIcon = screen.getByText('Fido.bat');
        expect(fidoIcon).toBeInTheDocument();
    });

    it('opens terminal when Fido.bat is double-clicked', () => {
        render(<App />);

        // Initial state: Terminal might be open by default in current App.jsx logic, 
        // but let's assume we can close it or just check it's there.
        // Current App.jsx default state has activeWindow='terminal'. 

        // Let's verify terminal exists
        const terminalWindow = screen.getByText(/Terminal.exe/i);
        expect(terminalWindow).toBeInTheDocument();

        // Close it
        const closeButton = screen.getByText('X');
        fireEvent.click(closeButton);
        expect(screen.queryByText(/Terminal.exe/i)).not.toBeInTheDocument();

        // Open it again via icon
        const fidoIcon = screen.getByText('Fido.bat');
        fireEvent.doubleClick(fidoIcon);

        expect(screen.getByText(/Terminal.exe/i)).toBeInTheDocument();
    });
});
