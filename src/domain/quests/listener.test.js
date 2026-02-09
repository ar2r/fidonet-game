import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { matchesMetadata, setupQuestListeners } from './listener';
import { EventBus } from '../events/bus';
import {
    MODEM_INITIALIZED,
    BBS_CONNECTED,
    DOWNLOAD_COMPLETED,
    MAIL_TOSSING_COMPLETED,
    MESSAGE_READ,
    MESSAGE_POSTED,
    ITEM_BOUGHT,
    DIALOGUE_COMPLETED,
    COMMAND_EXECUTED,
    ZMH_ACTIVITY_COMPLETED,
    FILE_SAVED,
} from '../events/types';

// Mock questEngine
vi.mock('./completion', () => ({
    completeQuestAndProgress: vi.fn(() => ['quest completed']),
}));

// Mock content/quests
vi.mock('../../content/quests', () => ({
    getQuestById: vi.fn(),
}));

import { completeQuestAndProgress } from './completion';
import { getQuestById } from '../../content/quests';

describe('matchesMetadata', () => {
    it('returns true when metadata is null or empty', () => {
        expect(matchesMetadata(null, {})).toBe(true);
        expect(matchesMetadata({}, {})).toBe(true);
        expect(matchesMetadata(undefined, {})).toBe(true);
    });

    it('matches exact item field', () => {
        expect(matchesMetadata({ item: 'modem_28800' }, { item: 'modem_28800' })).toBe(true);
        expect(matchesMetadata({ item: 'modem_28800' }, { item: 'other' })).toBe(false);
    });

    it('matches exact bbs field', () => {
        expect(matchesMetadata({ bbs: 'The Nexus' }, { bbs: 'The Nexus' })).toBe(true);
        expect(matchesMetadata({ bbs: 'The Nexus' }, { bbs: 'Other BBS' })).toBe(false);
    });

    it('matches exact area field', () => {
        expect(matchesMetadata({ area: 'su_flame' }, { area: 'su_flame' })).toBe(true);
        expect(matchesMetadata({ area: 'su_flame' }, { area: 'su_general' })).toBe(false);
    });

    it('matches exact path field', () => {
        expect(matchesMetadata({ path: 'C:\\FIDO\\BT.CFG' }, { path: 'C:\\FIDO\\BT.CFG' })).toBe(true);
        expect(matchesMetadata({ path: 'C:\\FIDO\\BT.CFG' }, { path: 'C:\\OTHER' })).toBe(false);
    });

    it('matches compound command + args', () => {
        const meta = { command: 'TRACE', args: 'TROLL.MASTER.SU' };
        expect(matchesMetadata(meta, { command: 'TRACE', args: 'TROLL.MASTER.SU', success: true })).toBe(true);
        expect(matchesMetadata(meta, { command: 'TRACE', args: 'OTHER' })).toBe(false);
        expect(matchesMetadata(meta, { command: 'OTHER', args: 'TROLL.MASTER.SU' })).toBe(false);
    });

    it('matches compound dialogueId + success', () => {
        const meta = { dialogueId: 'request_node_status', success: true };
        expect(matchesMetadata(meta, { dialogueId: 'request_node_status', success: true })).toBe(true);
        expect(matchesMetadata(meta, { dialogueId: 'request_node_status', success: false })).toBe(false);
        expect(matchesMetadata(meta, { dialogueId: 'other', success: true })).toBe(false);
    });

    it('matches subj_contains as substring check', () => {
        const meta = { area: 'su_flame', subj_contains: 'Rules' };
        expect(matchesMetadata(meta, { area: 'su_flame', subj_contains: 'Forum Rules v2.0' })).toBe(true);
        expect(matchesMetadata(meta, { area: 'su_flame', subj_contains: 'Hello World' })).toBe(false);
        expect(matchesMetadata(meta, { area: 'other', subj_contains: 'Rules' })).toBe(false);
    });

    it('skips validator key', () => {
        const meta = { path: 'C:\\FIDO\\T-MAIL.CTL', validator: 'tmail.valid' };
        expect(matchesMetadata(meta, { path: 'C:\\FIDO\\T-MAIL.CTL' })).toBe(true);
    });
});

describe('setupQuestListeners', () => {
    let dispatch;
    let actions;
    let getState;
    let cleanup;

    // We need to use a test-specific bus, but the listener imports the singleton.
    // Instead, we'll use the real eventBus singleton and clear it.
    // Actually, the listener imports eventBus from '../events/bus', so we use that.
    // Let's mock it at the module level or import the singleton.

    beforeEach(async () => {
        vi.clearAllMocks();

        // Import and clear the real eventBus
        const { eventBus } = await import('../events/bus');
        eventBus.clear();

        dispatch = vi.fn();
        actions = {
            completeQuest: vi.fn((id) => ({ type: 'quests/completeQuest', payload: id })),
            setActiveQuest: vi.fn((id) => ({ type: 'quests/setActiveQuest', payload: id })),
            updateSkill: vi.fn((p) => ({ type: 'player/updateSkill', payload: p })),
            setAct: vi.fn((a) => ({ type: 'gameState/setAct', payload: a })),
            completeStep: vi.fn((p) => ({ type: 'quests/completeStep', payload: p })),
        };

        getState = vi.fn();
    });

    afterEach(async () => {
        if (cleanup) cleanup();
        const { eventBus } = await import('../events/bus');
        eventBus.clear();
    });

    function setupWithState(questsState) {
        getState.mockReturnValue({ quests: questsState });
        cleanup = setupQuestListeners(dispatch, actions, getState);
    }

    it('completes single-step quest on matching event', async () => {
        const { eventBus } = await import('../events/bus');

        getQuestById.mockReturnValue({
            id: 'poll_boss',
            steps: [
                { id: 'run_poll', type: 'event', event: MAIL_TOSSING_COMPLETED },
            ],
        });

        setupWithState({ active: 'poll_boss', completed: [], stepProgress: {} });

        eventBus.publish(MAIL_TOSSING_COMPLETED, {});

        expect(dispatch).toHaveBeenCalledWith(
            actions.completeStep({ questId: 'poll_boss', stepId: 'run_poll' })
        );
        expect(completeQuestAndProgress).toHaveBeenCalledWith('poll_boss', dispatch, actions);
    });

    it('does not complete quest when metadata does not match', async () => {
        const { eventBus } = await import('../events/bus');

        getQuestById.mockReturnValue({
            id: 'hardware_upgrade',
            steps: [
                { id: 'buy_modem', type: 'event', event: ITEM_BOUGHT, metadata: { item: 'modem_28800' } },
            ],
        });

        setupWithState({ active: 'hardware_upgrade', completed: [], stepProgress: {} });

        eventBus.publish(ITEM_BOUGHT, { item: 'wrong_item' });

        expect(dispatch).not.toHaveBeenCalled();
        expect(completeQuestAndProgress).not.toHaveBeenCalled();
    });

    it('completes quest when metadata matches', async () => {
        const { eventBus } = await import('../events/bus');

        getQuestById.mockReturnValue({
            id: 'hardware_upgrade',
            steps: [
                { id: 'buy_modem', type: 'event', event: ITEM_BOUGHT, metadata: { item: 'modem_28800' } },
            ],
        });

        setupWithState({ active: 'hardware_upgrade', completed: [], stepProgress: {} });

        eventBus.publish(ITEM_BOUGHT, { item: 'modem_28800' });

        expect(dispatch).toHaveBeenCalledWith(
            actions.completeStep({ questId: 'hardware_upgrade', stepId: 'buy_modem' })
        );
        expect(completeQuestAndProgress).toHaveBeenCalledWith('hardware_upgrade', dispatch, actions);
    });

    it('handles multi-step quest — completes only after all EVENT steps done', async () => {
        const { eventBus } = await import('../events/bus');

        getQuestById.mockReturnValue({
            id: 'download_software',
            steps: [
                { id: 'download_tmail', type: 'event', event: DOWNLOAD_COMPLETED, metadata: { item: 't-mail' } },
                { id: 'download_golded', type: 'event', event: DOWNLOAD_COMPLETED, metadata: { item: 'golded' } },
            ],
        });

        // First download: only one step done
        setupWithState({ active: 'download_software', completed: [], stepProgress: {} });

        eventBus.publish(DOWNLOAD_COMPLETED, { item: 't-mail' });

        expect(dispatch).toHaveBeenCalledWith(
            actions.completeStep({ questId: 'download_software', stepId: 'download_tmail' })
        );
        expect(completeQuestAndProgress).not.toHaveBeenCalled();

        // Second download: both steps now done
        vi.clearAllMocks();
        getState.mockReturnValue({
            quests: {
                active: 'download_software',
                completed: [],
                stepProgress: { download_software: ['download_tmail'] },
            },
        });

        eventBus.publish(DOWNLOAD_COMPLETED, { item: 'golded' });

        expect(dispatch).toHaveBeenCalledWith(
            actions.completeStep({ questId: 'download_software', stepId: 'download_golded' })
        );
        expect(completeQuestAndProgress).toHaveBeenCalledWith('download_software', dispatch, actions);
    });

    it('ignores events when no active quest', async () => {
        const { eventBus } = await import('../events/bus');

        setupWithState({ active: null, completed: [], stepProgress: {} });

        eventBus.publish(MODEM_INITIALIZED, {});

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('ignores events that do not match any quest step', async () => {
        const { eventBus } = await import('../events/bus');

        getQuestById.mockReturnValue({
            id: 'init_modem',
            steps: [
                { id: 'init_modem', type: 'event', event: MODEM_INITIALIZED },
            ],
        });

        setupWithState({ active: 'init_modem', completed: [], stepProgress: {} });

        eventBus.publish(BBS_CONNECTED, { bbs: 'The Nexus' });

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('skips already-completed steps', async () => {
        const { eventBus } = await import('../events/bus');

        getQuestById.mockReturnValue({
            id: 'download_software',
            steps: [
                { id: 'download_tmail', type: 'event', event: DOWNLOAD_COMPLETED, metadata: { item: 't-mail' } },
                { id: 'download_golded', type: 'event', event: DOWNLOAD_COMPLETED, metadata: { item: 'golded' } },
            ],
        });

        setupWithState({
            active: 'download_software',
            completed: [],
            stepProgress: { download_software: ['download_tmail'] },
        });

        // Fire same event for already-completed step
        eventBus.publish(DOWNLOAD_COMPLETED, { item: 't-mail' });

        expect(dispatch).not.toHaveBeenCalled();
    });

    it('matches subj_contains in metadata', async () => {
        const { eventBus } = await import('../events/bus');

        getQuestById.mockReturnValue({
            id: 'read_rules',
            steps: [
                {
                    id: 'read_su_flame_rules',
                    type: 'event',
                    event: MESSAGE_READ,
                    metadata: { area: 'su_flame', subj_contains: 'Rules' },
                },
            ],
        });

        setupWithState({ active: 'read_rules', completed: [], stepProgress: {} });

        eventBus.publish(MESSAGE_READ, { area: 'su_flame', subj_contains: 'Forum Rules v2.0' });

        expect(dispatch).toHaveBeenCalledWith(
            actions.completeStep({ questId: 'read_rules', stepId: 'read_su_flame_rules' })
        );
        expect(completeQuestAndProgress).toHaveBeenCalledWith('read_rules', dispatch, actions);
    });

    it('matches command + args in metadata', async () => {
        const { eventBus } = await import('../events/bus');

        getQuestById.mockReturnValue({
            id: 'trace_troll',
            steps: [
                {
                    id: 'exec_trace',
                    type: 'event',
                    event: COMMAND_EXECUTED,
                    metadata: { command: 'TRACE', args: 'TROLL.MASTER.SU' },
                },
            ],
        });

        setupWithState({ active: 'trace_troll', completed: [], stepProgress: {} });

        eventBus.publish(COMMAND_EXECUTED, { command: 'TRACE', args: 'TROLL.MASTER.SU', success: true });

        expect(dispatch).toHaveBeenCalledWith(
            actions.completeStep({ questId: 'trace_troll', stepId: 'exec_trace' })
        );
        expect(completeQuestAndProgress).toHaveBeenCalledWith('trace_troll', dispatch, actions);
    });

    it('does not complete when quest is no longer active (double-fire guard)', async () => {
        const { eventBus } = await import('../events/bus');

        getQuestById.mockReturnValue({
            id: 'poll_boss',
            steps: [
                { id: 'run_poll', type: 'event', event: MAIL_TOSSING_COMPLETED },
            ],
        });

        // First call returns active quest, second call (re-check) returns null
        getState
            .mockReturnValueOnce({ quests: { active: 'poll_boss', completed: [], stepProgress: {} } })
            .mockReturnValueOnce({ quests: { active: null, completed: ['poll_boss'], stepProgress: {} } });

        cleanup = setupQuestListeners(dispatch, actions, getState);

        eventBus.publish(MAIL_TOSSING_COMPLETED, {});

        expect(dispatch).toHaveBeenCalledWith(
            actions.completeStep({ questId: 'poll_boss', stepId: 'run_poll' })
        );
        // Should NOT call completeQuestAndProgress because re-check shows quest no longer active
        expect(completeQuestAndProgress).not.toHaveBeenCalled();
    });

    it('skips MANUAL steps when checking completion', async () => {
        const { eventBus } = await import('../events/bus');

        getQuestById.mockReturnValue({
            id: 'init_modem',
            steps: [
                { id: 'run_terminal', type: 'manual', description: 'Run TERMINAL.EXE' },
                { id: 'init_modem', type: 'event', event: MODEM_INITIALIZED },
            ],
        });

        setupWithState({ active: 'init_modem', completed: [], stepProgress: {} });

        eventBus.publish(MODEM_INITIALIZED, { command: 'ATZ' });

        expect(dispatch).toHaveBeenCalledWith(
            actions.completeStep({ questId: 'init_modem', stepId: 'init_modem' })
        );
        // Should complete because all EVENT steps are done (MANUAL steps are ignored)
        expect(completeQuestAndProgress).toHaveBeenCalledWith('init_modem', dispatch, actions);
    });

    it('cleans up subscriptions on cleanup call', async () => {
        const { eventBus } = await import('../events/bus');

        getQuestById.mockReturnValue({
            id: 'init_modem',
            steps: [
                { id: 'init_modem', type: 'event', event: MODEM_INITIALIZED },
            ],
        });

        setupWithState({ active: 'init_modem', completed: [], stepProgress: {} });

        cleanup();
        cleanup = null;

        eventBus.publish(MODEM_INITIALIZED, { command: 'ATZ' });

        expect(dispatch).not.toHaveBeenCalled();
    });
});
