import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GoldED from './GoldED';
import fs from '../../engine/fileSystemInstance';
import { eventBus } from '../../domain/events/bus';
import { MESSAGE_POSTED } from '../../domain/events/types';
import gameStateSlice from '../../engine/slices/gameStateSlice';
import playerSlice from '../../engine/slices/playerSlice';

// Mock fs
vi.mock('../../engine/fileSystemInstance', () => ({
    default: {
        cat: vi.fn(),
        ls: vi.fn(),
    }
}));

// Mock eventBus
vi.mock('../../domain/events/bus', () => ({
    eventBus: {
        publish: vi.fn(),
        subscribe: vi.fn(() => () => {}),
    }
}));

const createTestStore = () => configureStore({
    reducer: {
        gameState: gameStateSlice.reducer,
        player: playerSlice.reducer,
    },
    preloadedState: {
        gameState: { time: '12:00', day: 1 },
        player: { name: 'TestUser', inventory: [] },
    }
});

describe('GoldED', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup fs.cat mock to return object (simulating the fix requirement)
        fs.cat.mockReturnValue({
            ok: true,
            content: `ORIGIN Test Origin
USERNAME TestUser
`
        });
    });

    it('sends a message with Ctrl+Enter', async () => {
        const store = createTestStore();
        const { container } = render(
            <Provider store={store}>
                <GoldED />
            </Provider>
        );

        // 1. Navigate to first area (ArrowDown/Up not needed if first selected) -> Enter
        // We need to focus the container to trigger keydown
        // The container is the first child of the render result
        const tuiContainer = container.firstChild;
        tuiContainer.focus();
        
        // Enter to go to msglist
        fireEvent.keyDown(tuiContainer, { key: 'Enter' });
        
        // 2. Open composer (Insert or 'n')
        fireEvent.keyDown(tuiContainer, { key: 'n' });

        // 3. Verify we are in composer
        expect(screen.getByText(/РЕДАКТОР СООБЩЕНИЙ/)).toBeInTheDocument();

        // 4. Fill inputs
        // Inputs: To, Subj, Body (TextArea)
        // We can find them by placeholder or value
        
        // The second input is Subject (first is To)
        const inputs = container.querySelectorAll('input');
        const subjInput = inputs[1];
        fireEvent.change(subjInput, { target: { value: 'Test Subject' } });
        
        const textArea = container.querySelector('textarea');
        fireEvent.change(textArea, { target: { value: 'Test Body' } });

        // 5. Press Ctrl+Enter in the textarea
        fireEvent.keyDown(textArea, { key: 'Enter', ctrlKey: true, bubbles: true });

        // 6. Assertions
        expect(fs.cat).toHaveBeenCalledWith('C:\\FIDO\\GOLDED.CFG');
        
        expect(eventBus.publish).toHaveBeenCalledWith(MESSAGE_POSTED, expect.objectContaining({
            subj: 'Test Subject',
            to: 'All', // Default value
        }));
        
        // Should return to msglist (Composer header gone)
        expect(screen.queryByText(/РЕДАКТОР СООБЩЕНИЙ/)).not.toBeInTheDocument();
    });

    it('sends a message using clickable buttons', async () => {
        const store = createTestStore();
        const { container } = render(
            <Provider store={store}>
                <GoldED />
            </Provider>
        );

        // 1. Click [ Select ] in Areas
        fireEvent.click(screen.getByText('[ Select ]'));
        
        // 2. Click [ New ] in MsgList
        fireEvent.click(screen.getByText('[ New ]'));

        // 3. Verify we are in composer
        expect(screen.getByText(/РЕДАКТОР СООБЩЕНИЙ/)).toBeInTheDocument();

        // 4. Fill inputs
        const inputs = container.querySelectorAll('input');
        const subjInput = inputs[1];
        fireEvent.change(subjInput, { target: { value: 'Button Test' } });
        
        const textArea = container.querySelector('textarea');
        fireEvent.change(textArea, { target: { value: 'Body Content' } });

        // 5. Click [ Send ]
        fireEvent.click(screen.getByText('[ Send ]'));

        // 6. Assertions
        expect(fs.cat).toHaveBeenCalledWith('C:\\FIDO\\GOLDED.CFG');
        
        expect(eventBus.publish).toHaveBeenCalledWith(MESSAGE_POSTED, expect.objectContaining({
            subj: 'Button Test',
        }));
        
        // Should return to msglist
        expect(screen.queryByText(/РЕДАКТОР СООБЩЕНИЙ/)).not.toBeInTheDocument();
    });
});