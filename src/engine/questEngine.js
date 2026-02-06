import { getQuestById } from './quests';

export function completeQuestAndProgress(questId, dispatch, actions) {
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

    if (quest.reward?.skills) {
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

    return notifications;
}

export function checkDownloadQuestCompletion(inventory, activeQuestId) {
    // download_software requires both t-mail and golded
    if (activeQuestId === 'download_software') {
        return inventory.includes('t-mail') && inventory.includes('golded');
    }
    return false;
}
