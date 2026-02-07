import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import StatusBar from './StatusBar';

// Mock the store
const createMockStore = (initialState) => {
    return configureStore({
        reducer: {
            gameState: (state = initialState.gameState || {}) => state,
            player: (state = initialState.player || {}) => state,
        },
        preloadedState: initialState
    });
};

const mockState = {
    gameState: {
        day: 5,
        time: '12:00',
        zmh: false
    },
    player: {
        stats: {
            sanity: 80,
            atmosphere: 50,
            money: 100,
            debt: 0
        },
        rank: 'User'
    }
};

describe('StatusBar Component', () => {
    it('renders day with correct style', () => {
        const store = createMockStore(mockState);
        render(
            <Provider store={store}>
                <StatusBar />
            </Provider>
        );

        const dayElement = screen.getByText(/5 д./);
        expect(dayElement).toBeInTheDocument();
        
        // Verify the style change
        expect(dayElement).toHaveStyle({
            fontSize: '14px',
            fontWeight: 'bold'
        });
    });

    it('renders time with correct style', () => {
        const store = createMockStore(mockState);
        render(
            <Provider store={store}>
                <StatusBar />
            </Provider>
        );

        const timeElement = screen.getByText(/12:00/);
        expect(timeElement).toBeInTheDocument();
        expect(timeElement).toHaveStyle({
            fontSize: '14px',
            fontWeight: 'bold'
        });
    });
});
