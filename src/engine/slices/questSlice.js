import { createSlice } from '@reduxjs/toolkit';

const questSlice = createSlice({
    name: 'quests',
    initialState: {
        active: 'init_modem',
        completed: [],
        hintLevel: 0,
        stepProgress: {}, // { 'quest_id': ['step_id_1', 'step_id_2'] }
    },
    reducers: {
        loadState: (state, action) => {
            return action.payload;
        },
        completeQuest: (state, action) => {
            const questId = action.payload;
            if (!state.completed.includes(questId)) {
                state.completed.push(questId);
            }
            if (state.active === questId) {
                state.active = null;
                state.hintLevel = 0;
            }
        },
        setActiveQuest: (state, action) => {
            state.active = action.payload;
            state.hintLevel = 0;
        },
        completeStep: (state, action) => {
            const { questId, stepId } = action.payload;
            if (!state.stepProgress[questId]) {
                state.stepProgress[questId] = [];
            }
            if (!state.stepProgress[questId].includes(stepId)) {
                state.stepProgress[questId].push(stepId);
            }
        },
        resetStepProgress: (state, action) => {
            const questId = action.payload;
            delete state.stepProgress[questId];
        },
        resetQuests: () => ({
            active: 'init_modem',
            completed: [],
            hintLevel: 0,
            stepProgress: {},
        }),
        revealHint: (state) => {
            state.hintLevel = Math.min(state.hintLevel + 1, 2);
        },
    }
});

export const {
    completeQuest, setActiveQuest, resetQuests, revealHint,
    completeStep, resetStepProgress,
    loadState: loadQuestState
} = questSlice.actions;

export default questSlice;
