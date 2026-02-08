import { getQuestById } from '../content/quests';
import { addItem, updateStat } from './store'; // Direct import from store slice exports if possible, or pass as arguments
import { eventBus } from '../domain/events/bus';
import { GAME_NOTIFICATION } from '../domain/events/types';

// Guard against double-completion within the same synchronous call stack
const recentlyCompleted = new Set();

export function completeQuestAndProgress(questId, dispatch, actions) {
    if (recentlyCompleted.has(questId)) return null;
    recentlyCompleted.add(questId);
    // Clear after microtask to allow future completions (e.g. debug skip)
    Promise.resolve().then(() => recentlyCompleted.delete(questId));

    const quest = getQuestById(questId);
    if (!quest) return null;

    const { completeQuest, setActiveQuest, updateSkill, setAct } = actions;

    // Mark quest completed
    dispatch(completeQuest(questId));

    // Award rewards
    const notifications = [];
    notifications.push(`╔═══════════════════════════════╗`);
    notifications.push(`║  КВЕСТ ВЫПОЛНЕН!              ║`);
    notifications.push(`║  "${quest.title}"`);

    // Process rewards (new schema format)
    if (quest.rewards && Array.isArray(quest.rewards)) {
        quest.rewards.forEach(reward => {
            if (reward.type === 'skill') {
                dispatch(updateSkill({ skill: reward.key, value: reward.delta }));
                notifications.push(`║  +${reward.delta} ${reward.key}`);
            } else if (reward.type === 'stat') {
                dispatch(updateStat({ stat: reward.key, value: reward.delta }));
                notifications.push(`║  ${reward.delta > 0 ? '+' : ''}${reward.delta} ${reward.key}`);
            } else if (reward.type === 'item') {
                dispatch(addItem(reward.item));
                notifications.push(`║  ПОЛУЧЕНО: ${reward.item}`);
            } else if (reward.type === 'money') {
                dispatch(updateStat({ stat: 'money', value: reward.delta }));
                notifications.push(`║  +${reward.delta} руб.`);
            }
        });
    }
    // Backwards compatibility with old reward format
    else if (quest.reward?.skills) {
        for (const [skill, value] of Object.entries(quest.reward.skills)) {
            dispatch(updateSkill({ skill, value }));
            notifications.push(`║  +${value} ${skill}`);
        }
    }

    notifications.push(`╚═══════════════════════════════╝`);

    // Set next quest
    if (quest.nextQuest) {
        dispatch(setActiveQuest(quest.nextQuest));
        const nextQ = getQuestById(quest.nextQuest);
        if (nextQ) {
            notifications.push('');
            notifications.push(`НОВЫЙ КВЕСТ: ${nextQ.title}`);
            notifications.push(`ЦЕЛЬ: ${nextQ.description}`);
        }
    }

    // Act transition
    if (quest.completesAct) {
        const nextAct = quest.completesAct + 1;
        dispatch(setAct(nextAct));
        notifications.push('');
        notifications.push(`═══════════════════════════════════════════`);
        notifications.push(`       АКТ ${quest.completesAct}: КОННЕКТ — ЗАВЕРШЕН`);
        notifications.push(`═══════════════════════════════════════════`);
        notifications.push(`       Добро пожаловать в Акт ${nextAct}!`);
        notifications.push(`═══════════════════════════════════════════`);
    }

    if (notifications.length > 0) {
        eventBus.publish(GAME_NOTIFICATION, { messages: notifications });
    }

    return notifications;
}

export function checkDownloadQuestCompletion(inventory, activeQuestId) {
    // download_software requires both t-mail and golded
    if (activeQuestId === 'download_software') {
        return inventory.includes('t-mail') && inventory.includes('golded');
    }
    return false;
}
