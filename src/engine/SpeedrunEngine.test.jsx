import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SpeedrunEngine } from './SpeedrunEngine';

// Mock the windowManager
vi.mock('./windowManager', () => ({
    openWindow: vi.fn((payload) => ({ type: 'windowManager/openWindow', payload })),
    closeWindow: vi.fn((payload) => ({ type: 'windowManager/closeWindow', payload })),
    default: (state = {}) => state, // Mock reducer
}));

// Mock the store for controlled testing
const createMockStore = (initialState) => {
    return configureStore({
        reducer: {
            gameState: (state = initialState.gameState || {}) => state,
            player: (state = initialState.player || {}) => state,
            network: (state = initialState.network || {}) => state,
            quests: (state = initialState.quests || {}) => state,
            windowManager: (state = initialState.windowManager || {}) => state,
        },
        preloadedState: initialState
    });
};

const mockState = {
    gameState: {
        speedrunMode: false,
        speedrunCommand: null,
    },
    // Add other slices if needed by selectors
    player: {},
    network: {},
    quests: {},
    windowManager: {}
};

describe('SpeedrunEngine', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('does not render when speedrunMode is false', () => {
        const store = createMockStore(mockState);
        render(
            <Provider store={store}>
                <SpeedrunEngine />
            </Provider>
        );

        const indicator = screen.queryByText(/SPEEDRUN MODE ACTIVE/);
        expect(indicator).not.toBeInTheDocument();
    });

    it('renders and starts script when speedrunMode is true', () => {
        const activeState = {
            ...mockState,
            gameState: { ...mockState.gameState, speedrunMode: true }
        };
        const store = createMockStore(activeState);

        render(
            <Provider store={store}>
                <SpeedrunEngine />
            </Provider>
        );

        const indicator = screen.getByText(/SPEEDRUN MODE ACTIVE/);
        expect(indicator).toBeInTheDocument();
        
        // Advance timers to trigger first step (which is resetGame fn, then wait)
        // Step 0: fn (reset)
        // Step 1: wait 1000ms
        
        act(() => {
            vi.advanceTimersByTime(100);
        });

        // Check if indicator is still there
        expect(screen.getByText(/SPEEDRUN MODE ACTIVE/)).toBeInTheDocument();
    });
});
