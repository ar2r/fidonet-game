import { configureStore, createSlice } from '@reduxjs/toolkit';
import windowManagerReducer from './windowManager';

// --- Game State Slice ---
const gameStateSlice = createSlice({
    name: 'gameState',
    initialState: {
        day: 1,
        phase: 'night', // 'day', 'night'
        time: '23:00',
        timeMinutes: 1380, // 23:00 in minutes
        zmh: false, // Zone Mail Hour
        act: 1,
        gameOver: false,
        gameOverReason: null,
        virusActive: false,
        virusStage: 'none', // 'none', 'cascade', 'cleaning'
    },
    reducers: {
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
        }),
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
            money: 50000, // рублей
            debt: 0,
        },
        skills: {
            typing: 1,
            hardware: 0,
            software: 0,
            eloquence: 0,
        },
        inventory: [],
        karma: 0,
        rank: 'Lamer',
        lastBillDay: 0,
    },
    reducers: {
        updateStat: (state, action) => {
            const { stat, value } = action.payload;
            if (state.stats[stat] !== undefined) {
                // Allow debt to grow indefinitely, others capped 0-100 usually (except money)
                if (stat === 'money' || stat === 'debt') {
                    state.stats[stat] += value;
                } else {
                    state.stats[stat] = Math.max(0, Math.min(100, state.stats[stat] + value));
                }
            }
        },
        payBill: (state, action) => {
            const amount = action.payload;
            if (state.stats.money >= amount) {
                state.stats.money -= amount;
                state.stats.debt = Math.max(0, state.stats.debt - amount);
            }
        },
        setLastBillDay: (state, action) => {
            state.lastBillDay = action.payload;
        },
        updateSkill: (state, action) => {
            const { skill, value } = action.payload;
            if (state.skills[skill] !== undefined) {
                state.skills[skill] = Math.max(0, state.skills[skill] + value);
            }
        },
        addItem: (state, action) => {
            if (!state.inventory.includes(action.payload)) {
                state.inventory.push(action.payload);
            }
        },
        setRank: (state, action) => {
            state.rank = action.payload;
        },
        resetPlayer: () => ({
            name: 'SysOp',
            stats: { sanity: 100, momsPatience: 100, money: 50000 },
            skills: { typing: 1, hardware: 0, software: 0, eloquence: 0 },
            inventory: [],
            karma: 0,
            rank: 'Lamer',
        }),
    }
});

// --- Network Slice ---
const networkSlice = createSlice({
    name: 'network',
    initialState: {
        connected: false,
        currentBBS: null,
        connectionStatus: 'IDLE',
        terminalMode: 'IDLE',
        terminalProgramRunning: false,
        downloadQueue: [],
        logs: [],
        modemInitialized: false,
        activeDialogue: null,
        dialogueStep: 0,
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
            state.terminalMode = 'IDLE';
            state.activeDialogue = null;
            state.dialogueStep = 0;
        },
        setStatus: (state, action) => {
            state.connectionStatus = action.payload;
        },
        setTerminalMode: (state, action) => {
            state.terminalMode = action.payload;
        },
        addLog: (state, action) => {
            state.logs.push(action.payload);
        },
        initializeModem: (state) => {
            state.modemInitialized = true;
        },
        setTerminalProgram: (state, action) => {
            state.terminalProgramRunning = action.payload;
        },
        setDialogue: (state, action) => {
            const { id, step } = action.payload;
            state.activeDialogue = id;
            state.dialogueStep = step;
        },
        resetNetwork: () => ({
            connected: false,
            currentBBS: null,
            connectionStatus: 'IDLE',
            terminalMode: 'IDLE',
            terminalProgramRunning: false,
            downloadQueue: [],
            logs: [],
            modemInitialized: false,
            activeDialogue: null,
            dialogueStep: 0,
        }),
    }
});

// --- Quest Slice ---
const questSlice = createSlice({
    name: 'quests',
    initialState: {
        active: 'init_modem',
        completed: []
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
        resetQuests: () => ({
            active: 'init_modem',
            completed: [],
        }),
    }
});

export const {
    advanceTime, setTimeMinutes, setPhase, setZMH,
    advanceDay, setAct, setGameOver, setVirusActive, setVirusStage, resetGame
} = gameStateSlice.actions;

export const {
    updateStat, updateSkill, addItem, setRank, resetPlayer, payBill, setLastBillDay
} = playerSlice.actions;

export const {
    connect, disconnect, setStatus, setTerminalMode,
    addLog, initializeModem, setTerminalProgram, setDialogue, resetNetwork
} = networkSlice.actions;

export const {
    completeQuest, setActiveQuest, resetQuests
} = questSlice.actions;

export const store = configureStore({
    reducer: {
        gameState: gameStateSlice.reducer,
        player: playerSlice.reducer,
        network: networkSlice.reducer,
        quests: questSlice.reducer,
        windowManager: windowManagerReducer,
    },
});
