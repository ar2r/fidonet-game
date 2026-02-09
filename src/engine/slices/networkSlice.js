import { createSlice } from '@reduxjs/toolkit';

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
        currentOptions: [],
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
            state.currentOptions = [];
        },
        setStatus: (state, action) => {
            state.connectionStatus = action.payload;
        },
        setTerminalMode: (state, action) => {
            state.terminalMode = action.payload;
        },
        setOptions: (state, action) => {
            state.currentOptions = action.payload || [];
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
        loadState: (state, action) => {
            return action.payload;
        },
    }
});

export const {
    connect, disconnect, setStatus, setTerminalMode, setOptions,
    addLog, initializeModem, setTerminalProgram, setDialogue, resetNetwork,
    loadState: loadNetworkState
} = networkSlice.actions;

export default networkSlice;
