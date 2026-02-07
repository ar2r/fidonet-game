import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleTMailConfigComplete, handleGoldEDConfigComplete, shouldCompleteQuestOnFileSave } from './service';

describe('Quest Service', () => {
    let dispatch;
    let actions;
    let questState;

    beforeEach(() => {
        dispatch = vi.fn();
        actions = {
            completeQuest: vi.fn((id) => ({ type: 'quests/completeQuest', payload: id })),
            setActiveQuest: vi.fn((id) => ({ type: 'quests/setActiveQuest', payload: id })),
            updateSkill: vi.fn((payload) => ({ type: 'player/updateSkill', payload })),
            setAct: vi.fn((act) => ({ type: 'gameState/setAct', payload: act })),
        };
        questState = {
            active: 'configure_tmail',
            completed: [],
        };
    });

    describe('handleTMailConfigComplete', () => {
        const validConfig = {
            address: '2:5020/123.45',
            password: 'NEXUS95',
            bossAddress: '2:5020/123',
            bossPhone: '555-3389',
            inbound: 'C:\\FIDO\\INBOUND',
            outbound: 'C:\\FIDO\\OUTBOUND',
        };

        const mockFs = {
            cat: vi.fn(() => ({ ok: true, content: 'dummy' })),
            createDir: vi.fn(() => ({ ok: true })),
            writeFile: vi.fn(() => ({ ok: true })),
            ls: vi.fn(() => ({ ok: true, entries: [] })),
        };

        it('validates config format', () => {
            const invalidConfig = { ...validConfig, address: 'invalid' };
            const result = handleTMailConfigComplete(invalidConfig, mockFs, questState, dispatch, actions);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Неверный формат адреса');
        });

        it('checks config correctness', () => {
            const wrongConfig = { ...validConfig, password: 'WRONG' };
            const result = handleTMailConfigComplete(wrongConfig, mockFs, questState, dispatch, actions);

            expect(result.success).toBe(false);
            expect(result.error).toContain('содержит ошибки');
        });

        it('completes quest when config is valid and quest is active', () => {
            const result = handleTMailConfigComplete(validConfig, mockFs, questState, dispatch, actions);

            expect(result.success).toBe(true);
            expect(dispatch).toHaveBeenCalled();
        });

        it('does not complete quest if quest is not active', () => {
            questState.active = 'other_quest';
            const result = handleTMailConfigComplete(validConfig, mockFs, questState, dispatch, actions);

            expect(result.success).toBe(true);
            expect(dispatch).not.toHaveBeenCalled();
        });
    });

    describe('handleGoldEDConfigComplete', () => {
        const validConfig = {
            username: 'Vasya',
            realname: 'Vasya Pupkin',
            address: '2:5020/123.45',
            origin: 'Moscow, Russia',
        };

        it('validates username presence', () => {
            const result = handleGoldEDConfigComplete({}, questState, dispatch, actions);

            expect(result.success).toBe(false);
            expect(result.error).toContain('имя пользователя');
        });

        it('validates address presence', () => {
            const result = handleGoldEDConfigComplete(
                { username: 'Vasya' },
                questState,
                dispatch,
                actions
            );

            expect(result.success).toBe(false);
            expect(result.error).toContain('адрес');
        });

        it('completes quest and signals animation when active', () => {
            questState.active = 'configure_golded';
            const result = handleGoldEDConfigComplete(validConfig, questState, dispatch, actions);

            expect(result.success).toBe(true);
            expect(result.triggerAnimation).toBe(true);
            expect(dispatch).toHaveBeenCalled();
        });

        it('does not trigger animation if quest is not active', () => {
            questState.active = 'other_quest';
            const result = handleGoldEDConfigComplete(validConfig, questState, dispatch, actions);

            expect(result.success).toBe(true);
            expect(result.triggerAnimation).toBe(false);
        });
    });

    describe('shouldCompleteQuestOnFileSave', () => {
        it('returns true for T-Mail config save when quest is active', () => {
            questState.active = 'configure_tmail';
            const result = shouldCompleteQuestOnFileSave('C:\\FIDO\\T-MAIL.CTL', questState);
            expect(result).toBe(true);
        });

        it('returns true for GoldED config save when quest is active', () => {
            questState.active = 'configure_golded';
            const result = shouldCompleteQuestOnFileSave('C:\\FIDO\\GOLDED.CFG', questState);
            expect(result).toBe(true);
        });

        it('returns false for unrelated files', () => {
            questState.active = 'configure_tmail';
            const result = shouldCompleteQuestOnFileSave('C:\\FIDO\\OTHER.TXT', questState);
            expect(result).toBe(false);
        });

        it('returns false when quest is not active', () => {
            questState.active = 'other_quest';
            const result = shouldCompleteQuestOnFileSave('C:\\FIDO\\T-MAIL.CTL', questState);
            expect(result).toBe(false);
        });
    });
});
