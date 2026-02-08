import { createSlice } from '@reduxjs/toolkit';

const playerSlice = createSlice({
    name: 'player',
    initialState: {
        name: 'SysOp',
        stats: {
            sanity: 100,
            atmosphere: 100, // Бывшее momsPatience. 100 = Тишина, 0 = Скандал
            money: 2500, // рублей
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
        equipment: {
            pc: '386 DX-40',
            modem: 'No-name 2400',
            monitor: '14" VGA'
        }
    },
    reducers: {
        loadState: (state, action) => {
            return action.payload;
        },
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
        setEquipment: (state, action) => {
             const { type, value } = action.payload;
             if (state.equipment[type]) {
                 state.equipment[type] = value;
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
            stats: { sanity: 100, atmosphere: 100, money: 50000 },
            skills: { typing: 1, hardware: 0, software: 0, eloquence: 0 },
            inventory: [],
            karma: 0,
            rank: 'Lamer',
            equipment: {
                pc: '386 DX-40',
                modem: 'No-name 2400',
                monitor: '14" VGA'
            }
        }),
    }
});

export const {
    updateStat, updateSkill, addItem, setRank, resetPlayer, payBill, setLastBillDay, setEquipment,
    loadState: loadPlayerState
} = playerSlice.actions;

export default playerSlice;
