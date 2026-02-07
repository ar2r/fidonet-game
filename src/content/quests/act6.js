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
        description: 'Вас вызывает Региональный Координатор (RC5020). Это ваш шанс войти в историю.',
        hint: 'Подключитесь к BBS и выберите чат. Координатор сам выйдет на связь.',
        prerequisites: ['super_sysop'],
        steps: [
            {
                id: 'final_dialogue',
                type: StepType.EVENT,
                event: DIALOGUE_COMPLETED,
                description: 'Пройти финальное собеседование',
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
        description: 'Поздравляем! Вы прошли FidoNet Simulator.',
        hint: 'Спасибо за игру.',
        prerequisites: ['meet_coordinator'],
        steps: [],
        rewards: [],
    }
];
