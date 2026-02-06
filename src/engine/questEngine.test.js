import { describe, it, expect, vi } from 'vitest';
import { completeQuestAndProgress, checkDownloadQuestCompletion } from './questEngine';

describe('questEngine', () => {
    describe('completeQuestAndProgress', () => {
        it('completes init_modem and sets next quest', () => {
            const dispatch = vi.fn();
            const actions = {
                completeQuest: vi.fn(id => ({ type: 'quests/completeQuest', payload: id })),
                setActiveQuest: vi.fn(id => ({ type: 'quests/setActiveQuest', payload: id })),
                updateSkill: vi.fn(data => ({ type: 'player/updateSkill', payload: data })),
                setAct: vi.fn(act => ({ type: 'gameState/setAct', payload: act })),
            };

            const notifications = completeQuestAndProgress('init_modem', dispatch, actions);

            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'quests/completeQuest' }));
            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'quests/setActiveQuest' }));
            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'player/updateSkill' }));
            expect(notifications).toBeDefined();
            expect(notifications.some(l => l.includes('КВЕСТ ВЫПОЛНЕН'))).toBe(true);
            expect(notifications.some(l => l.includes('Первый Контакт'))).toBe(true);
        });

        it('completes download_software and triggers act transition', () => {
            const dispatch = vi.fn();
            const actions = {
                completeQuest: vi.fn(id => ({ type: 'quests/completeQuest', payload: id })),
                setActiveQuest: vi.fn(id => ({ type: 'quests/setActiveQuest', payload: id })),
                updateSkill: vi.fn(data => ({ type: 'player/updateSkill', payload: data })),
                setAct: vi.fn(act => ({ type: 'gameState/setAct', payload: act })),
            };

            const notifications = completeQuestAndProgress('download_software', dispatch, actions);

            expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'gameState/setAct' }));
            expect(notifications.some(l => l.includes('ЗАВЕРШЕН'))).toBe(true);
        });

        it('returns null for unknown quest', () => {
            const dispatch = vi.fn();
            const actions = {};
            const result = completeQuestAndProgress('nonexistent', dispatch, actions);
            expect(result).toBeNull();
        });
    });

    describe('checkDownloadQuestCompletion', () => {
        it('returns true when both items are in inventory', () => {
            expect(checkDownloadQuestCompletion(['t-mail', 'golded'], 'download_software')).toBe(true);
        });

        it('returns false when only t-mail is present', () => {
            expect(checkDownloadQuestCompletion(['t-mail'], 'download_software')).toBe(false);
        });

        it('returns false when only golded is present', () => {
            expect(checkDownloadQuestCompletion(['golded'], 'download_software')).toBe(false);
        });

        it('returns false for wrong quest id', () => {
            expect(checkDownloadQuestCompletion(['t-mail', 'golded'], 'init_modem')).toBe(false);
        });
    });
});
