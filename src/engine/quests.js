export const QUESTS = {
    // --- Act 1: Коннект ---
    INIT_MODEM: {
        id: 'init_modem',
        title: 'Строка инициализации',
        description: 'Запустите TERMINAL.EXE и инициализируйте модем.',
        hint: 'Сначала наберите TERMINAL, затем внутри программы ATZ.',
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
        nextQuest: 'configure_tmail',
        completesAct: 1,
    },
    // --- Act 2: Настройка ---
    CONFIGURE_TMAIL: {
        id: 'configure_tmail',
        title: 'Настройка T-Mail',
        description: 'Настройте T-Mail: заполните адрес, пароль, босс-ноду.',
        hint: 'Запустите T-Mail Setup.exe с рабочего стола. Информацию можно получить у Сисопа BBS (команда C в меню) и прочитать README.1ST (команда TYPE C:\\FIDO\\README.1ST).',
        act: 2,
        reward: { skills: { software: 2, typing: 1 } },
        nextQuest: 'configure_golded',
        completesAct: null,
    },
    CONFIGURE_GOLDED: {
        id: 'configure_golded',
        title: 'Настройка GoldED',
        description: 'Настройте GoldED: укажите имя, адрес и Origin.',
        hint: 'Запустите GoldED с рабочего стола. Используйте тот же адрес, что и в T-Mail. Origin — это подпись в конце ваших писем.',
        act: 2,
        reward: { skills: { software: 2, typing: 1 } },
        nextQuest: null, // TODO: first_poll in Phase 7
        completesAct: 2,
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
