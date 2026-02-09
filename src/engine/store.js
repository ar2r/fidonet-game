import { configureStore } from '@reduxjs/toolkit';
import windowManagerReducer from './windowManager';
import gameStateSlice, {
    advanceTime, setTimeMinutes, setPhase, setZMH,
    advanceDay, setAct, setGameOver, setVirusActive, setVirusStage, resetGame,
    setOnboardingSeen, loadGameState
} from './slices/gameStateSlice';
import playerSlice, {
    updateStat, updateSkill, addItem, setRank, resetPlayer, payBill, setLastBillDay, setEquipment,
    loadPlayerState
} from './slices/playerSlice';
import networkSlice, {
    connect, disconnect, setStatus, setTerminalMode,
    addLog, initializeModem, setTerminalProgram, setDialogue, resetNetwork,
    loadNetworkState
} from './slices/networkSlice';
import questSlice, {
    completeQuest, setActiveQuest, resetQuests, revealHint,
    completeStep, resetStepProgress, loadQuestState
} from './slices/questSlice';

// Re-export all actions for backward compatibility
export {
    advanceTime, setTimeMinutes, setPhase, setZMH,
    advanceDay, setAct, setGameOver, setVirusActive, setVirusStage, resetGame,
    setOnboardingSeen, loadGameState,

    updateStat, updateSkill, addItem, setRank, resetPlayer, payBill, setLastBillDay, setEquipment,
    loadPlayerState,

    connect, disconnect, setStatus, setTerminalMode,
    addLog, initializeModem, setTerminalProgram, setDialogue, resetNetwork,
    loadNetworkState,

    completeQuest, setActiveQuest, resetQuests, revealHint,
    completeStep, resetStepProgress, loadQuestState,
};

export const store = configureStore({
    reducer: {
        gameState: gameStateSlice.reducer,
        player: playerSlice.reducer,
        network: networkSlice.reducer,
        quests: questSlice.reducer,
        windowManager: windowManagerReducer,
    },
});
