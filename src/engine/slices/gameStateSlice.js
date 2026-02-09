import { createSlice } from '@reduxjs/toolkit';

const gameStateSlice = createSlice({
    name: 'gameState',
    initialState: {
        day: 1,
        phase: 'night', // 'day', 'night'
        time: '23:00',
        timeMinutes: 1380, // 23:00 in minutes
        zmh: false, // Zone Mail Hour
        act: 1,
        timeSpeed: 1, // 1x, 5x, 10x
        gameOver: false,
        gameOverReason: null,
        virusActive: false,
        virusStage: 'none', // 'none', 'cascade', 'cleaning'
        onboardingSeen: false,
    },
    reducers: {
        setOnboardingSeen: (state) => {
            state.onboardingSeen = true;
        },
        setTimeSpeed: (state, action) => {
            state.timeSpeed = action.payload;
        },
        advanceTime: (state, action) => {
            state.time = action.payload;
        },
        setTimeMinutes: (state, action) => {
            state.timeMinutes = action.payload;
        },
        setPhase: (state, action) => {
            state.phase = action.payload;
        },
        setZMH: (state, action) => {
            state.zmh = action.payload;
        },
        advanceDay: (state, action) => {
            state.day += (action.payload || 1);
        },
        setAct: (state, action) => {
            state.act = action.payload;
        },
        setGameOver: (state, action) => {
            state.gameOver = true;
            state.gameOverReason = action.payload;
        },
        setVirusActive: (state, action) => {
            state.virusActive = action.payload;
        },
        setVirusStage: (state, action) => {
            state.virusStage = action.payload;
        },
        resetGame: () => ({
            day: 1,
            phase: 'night',
            time: '23:00',
            timeMinutes: 1380,
            zmh: false,
            act: 1,
            gameOver: false,
            gameOverReason: null,
            virusActive: false,
            virusStage: 'none',
            onboardingSeen: false,
        }),
        loadState: (state, action) => {
            return action.payload;
        },
    }
});

export const {
    advanceTime, setTimeMinutes, setPhase, setZMH,
    advanceDay, setAct, setGameOver, setVirusActive, setVirusStage, resetGame,
    setOnboardingSeen, setTimeSpeed,
    loadState: loadGameState
} = gameStateSlice.actions;

export default gameStateSlice;
