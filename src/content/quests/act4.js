/**
 * Act 4 Quests: Апгрейд
 * Goal: Buy hardware, Become a Node
 */

import { StepType } from '../../domain/quests/schema';
import { ITEM_BOUGHT } from '../../domain/events/types';

export const ACT4_QUESTS = [
    {
        id: 'hardware_upgrade',
        act: 4,
        title: 'Апгрейд Модема',
        description: 'Для работы нодой нужен быстрый модем. Купите US Robotics Courier на радиорынке.',
        hint: 'Заработайте денег командой WORK или дождитесь ALLOWANCE. Затем откройте Рынок и купите модем.',
        prerequisites: ['reply_welcome'],
        steps: [
            {
                id: 'buy_modem',
                type: StepType.EVENT,
                event: ITEM_BOUGHT,
                description: 'Купить US Robotics Courier 28.8k',
                metadata: {
                    item: 'modem_28800',
                },
            },
        ],
        rewards: [
            { type: 'skill', key: 'hardware', delta: 2 },
            { type: 'stat', key: 'fido_fame', delta: 5 },
        ],
        nextQuest: 'request_node',
    },

    {
        id: 'request_node',
        act: 4,
        title: 'Запрос Ноды',
        description: 'Поговорите с Сисопом (Архитектором) о получении статуса Ноды.',
        hint: 'Подключитесь к BBS и выберите (C)hat в главном меню. Будьте вежливы и убедительны.',
        prerequisites: ['hardware_upgrade'],
        steps: [
            {
                id: 'talk_to_sysop',
                type: StepType.EVENT,
                event: 'dialogue.completed',
                description: 'Договориться с Сисопом о статусе ноды',
                metadata: {
                    dialogueId: 'request_node_status',
                    success: true,
                },
            },
        ],
        rewards: [
            { type: 'skill', key: 'eloquence', delta: 2 },
            { type: 'stat', key: 'karma', delta: 10 },
        ],
        nextQuest: null, // Next: Setup BinkleyTerm
        completesAct: 4,
    },
];
