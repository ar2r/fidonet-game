export const QUESTS = {
    // --- Act 1: Коннект ---
    INIT_MODEM: {
        id: 'init_modem',
        title: 'Строка инициализации',
        description: 'Инициализируйте модем командой ATZ или AT&F.',
        hint: 'Введите ATZ в терминале.',
        act: 1,
        reward: { skills: { typing: 1 } },
        nextQuest: 'first_connect',
    },
    FIRST_CONNECT: {
        id: 'first_connect',
        title: 'Первый Контакт',
        description: 'Подключитесь к BBS The Nexus (555-3389).',
        hint: 'Наберите DIAL 555-3389 после инициализации модема.',
        act: 1,
        reward: { skills: { typing: 1 } },
        nextQuest: 'download_software',
    },
    DOWNLOAD_SOFTWARE: {
        id: 'download_software',
        title: 'Скачать софт',
        description: 'Скачайте T-Mail и GoldED из файловой области BBS.',
        hint: 'В меню BBS нажмите F, затем скачайте оба файла.',
        act: 1,
        reward: { skills: { typing: 1, software: 1 } },
        nextQuest: null, // End of Act 1
        completesAct: 1,
    },
};

export const QUEST_LIST = Object.values(QUESTS);

export function getQuestById(id) {
    return QUEST_LIST.find(q => q.id === id) || null;
}

export function getQuestTitle(id) {
    const quest = getQuestById(id);
    return quest ? quest.title : 'Нет активного квеста';
}
