import { configureStore, createSlice } from '@reduxjs/toolkit';

// --- Game State Slice ---
const gameStateSlice = createSlice({
    name: 'gameState',
    initialState: {
        day: 1,
        phase: 'night', // 'day', 'night'
        time: '23:00',
        zmh: false, // Zone Mail Hour
    },
    reducers: {
        advanceTime: (state, action) => {
            // Simple time advancement logic (placeholder)
            state.time = action.payload;
        },
        setPhase: (state, action) => {
            state.phase = action.payload;
        },
        toggleZMH: (state) => {
            state.zmh = !state.zmh;
        }
    }
});

// --- Player Slice ---
const playerSlice = createSlice({
    name: 'player',
    initialState: {
        name: 'SysOp',
        stats: {
            sanity: 100,
            momsPatience: 100,
            money: 10,
        },
        skills: {
            typing: 1,
            hardware: 0,
        },
        inventory: [],
        karma: 0,
        rank: 'Lamer'
    },
    reducers: {
        updateStat: (state, action) => {
            const { stat, value } = action.payload;
            if (state.stats[stat] !== undefined) {
                state.stats[stat] = Math.max(0, Math.min(100, state.stats[stat] + value));
            }
        },
        addItem: (state, action) => {
            state.inventory.push(action.payload);
        }
    }
});

// --- Network Slice ---
const networkSlice = createSlice({
    name: 'network',
    initialState: {
        connected: false,
        currentBBS: null,
        connectionStatus: 'IDLE', // IDLE, DIALING, CONNECTED, HANDSHAKE
        downloadQueue: [],
        logs: [],
        modemInitialized: false,
    },
    reducers: {
        connect: (state, action) => {
            state.connected = true;
            state.currentBBS = action.payload;
            state.connectionStatus = 'CONNECTED';
        },
        disconnect: (state) => {
            state.connected = false;
            state.currentBBS = null;
            state.connectionStatus = 'IDLE';
        },
        setStatus: (state, action) => {
            state.connectionStatus = action.payload;
        },
        addLog: (state, action) => {
            state.logs.push(action.payload);
        },
        initializeModem: (state) => {
            state.modemInitialized = true;
        }
    }
});

// --- Quest Slice ---
const questSlice = createSlice({
    name: 'quests',
    initialState: {
        active: 'get_online', // Start with the first quest active
        completed: [] // List of completed quest IDs
    },
    reducers: {
        completeQuest: (state, action) => {
            const questId = action.payload;
            if (!state.completed.includes(questId)) {
                state.completed.push(questId);
            }
            if (state.active === questId) {
                state.active = null;
            }
        },
        setActiveQuest: (state, action) => {
            state.active = action.payload;
        },
        resetQuest: (state, action) => {
            const questId = action.payload;
            // Remove from completed if present
            state.completed = state.completed.filter(id => id !== questId);
            // Set as active
            state.active = questId;
        }
    }
});

export const { advanceTime, setPhase, toggleZMH } = gameStateSlice.actions;
export const { updateStat, addItem } = playerSlice.actions;
export const { connect, disconnect, setStatus, addLog, initializeModem } = networkSlice.actions;
export const { completeQuest, setActiveQuest, resetQuest } = questSlice.actions;

export const store = configureStore({
    reducer: {
        gameState: gameStateSlice.reducer,
        player: playerSlice.reducer,
        network: networkSlice.reducer,
        quests: questSlice.reducer,
    },
});
