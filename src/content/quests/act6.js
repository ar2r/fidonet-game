/**
 * Act 6 Quests: Финал
 * Goal: Become Coordinator or Network Founder
 */

import { StepType } from '../../domain/quests/schema';
import { DIALOGUE_COMPLETED } from '../../domain/events/types';

export const ACT6_QUESTS = [
    {
        id: 'meet_coordinator',
        act: 6,
        title: 'Вызов Координатора',
        description: 'Ваш статус привлек внимание. Региональный Координатор (RC5020) запрашивает личный канал связи.',
        hints: [
            'Это важный разговор.',
            'Не заставляйте начальство ждать.',
            'Примите вызов в режиме CHAT.'
        ],
        prerequisites: ['super_sysop'],
        steps: [
            {
                id: 'final_dialogue',
                type: StepType.EVENT,
                event: DIALOGUE_COMPLETED,
                description: 'Пройти собеседование с Координатором',
                metadata: { dialogueId: 'coordinator_finale', success: true }
            }
        ],
        rewards: [
            { type: 'stat', key: 'fido_fame', delta: 500 },
        ],
        nextQuest: 'game_completed',
        completesAct: 6,
    },
    {
        id: 'game_completed',
        act: 6,
        title: 'Конец Игры',
        description: 'Вы прошли долгий путь и оставили свой след в истории FidoNet.',
        hints: [
            'История завершена.',
            'Но сеть продолжает жить.',
            'Спасибо за игру!'
        ],
        prerequisites: ['meet_coordinator'],
        steps: [],
        rewards: [],
    }
];
