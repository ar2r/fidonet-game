/**
 * Act 5 Quests: Кризис и Выбор Пути
 * Goal: Solve the crisis using Skills (Hardware vs Eloquence)
 */

import { StepType } from '../../domain/quests/schema';
import { DIALOGUE_COMPLETED, ITEM_BOUGHT } from '../../domain/events/types';

export const ACT5_QUESTS = [
    {
        id: 'crisis_choice',
        act: 5,
        title: 'Выбор Пути',
        description: 'В сети назревает кризис. Помехи на линии мешают работе, а в эхах идет война. Выберите свой способ решения.',
        hint: 'Поговорите с Сисопом (Чат) или изучите проблемы с железом (Магазин/Инвентарь).',
        prerequisites: ['nightly_uptime'], // From Act 4
        steps: [
            {
                id: 'choose_path',
                type: StepType.MANUAL, // Triggered via dialogue choice
                description: 'Выбрать путь Технаря или Дипломата',
            },
        ],
        rewards: [],
        nextQuest: null, // Dynamic: 'fix_hardware' or 'negotiate_peace'
    },
    
    // Technician Path
    {
        id: 'fix_hardware',
        act: 5,
        title: 'Шумоподавление',
        description: 'Соберите фильтр для линии, чтобы устранить помехи.',
        hint: 'Купите "Набор для пайки" на радиорынке и используйте навык Hardware.',
        prerequisites: ['crisis_choice'],
        steps: [
            {
                id: 'buy_solder_kit',
                type: StepType.EVENT,
                event: ITEM_BOUGHT,
                description: 'Купить Набор для пайки',
                metadata: { item: 'solder_kit' }
            }
        ],
        rewards: [{ type: 'skill', key: 'hardware', delta: 5 }],
        nextQuest: 'super_sysop',
    },

    // Diplomat Path
    {
        id: 'negotiate_peace',
        act: 5,
        title: 'Миротворец',
        description: 'Успокойте троллей в эхоконференции SU.FLAME.',
        hint: 'Используйте GoldED. Найдите тред "War" и выберите правильные ответы.',
        prerequisites: ['crisis_choice'],
        steps: [
            {
                id: 'win_flame_war',
                type: StepType.EVENT,
                event: DIALOGUE_COMPLETED,
                description: 'Выиграть спор в эхе',
                metadata: { dialogueId: 'flame_war_peace', success: true }
            }
        ],
        rewards: [{ type: 'skill', key: 'eloquence', delta: 5 }],
        nextQuest: 'super_sysop',
    },

    {
        id: 'super_sysop',
        act: 5,
        title: 'Super SysOp',
        description: 'Вы стали легендой района. Игра пройдена (пока что).',
        hint: 'Наслаждайтесь статусом.',
        prerequisites: ['fix_hardware', 'negotiate_peace'], // OR logic handled in engine? No, usually AND. Logic needs dynamic branching.
        steps: [],
        rewards: [{ type: 'stat', key: 'fido_fame', delta: 100 }],
        nextQuest: 'meet_coordinator',
        completesAct: 5,
    }
];
