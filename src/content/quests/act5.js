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
        title: 'Время решений',
        description: 'В сети неспокойно. Технические сбои накладываются на социальные конфликты. Вам предстоит выбрать метод решения проблемы.',
        hints: [
            'Вы можете подойти к проблеме как инженер или как дипломат.',
            'Ищите решение на Радиорынке или в общении с людьми.',
            'Выбор определит дальнейшие действия.'
        ],
        prerequisites: ['nightly_uptime'], // From Act 4
        steps: [
            {
                id: 'choose_path',
                type: StepType.MANUAL, // Triggered via dialogue choice
                description: 'Определиться со стратегией',
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
        description: 'Канал связи нестабилен из-за физических помех. Соберите фильтр для очистки сигнала.',
        hints: [
            'Посетите Радиорынок.',
            'Вам понадобятся инструменты для работы с железом.',
            'Ищите "Набор для пайки".'
        ],
        prerequisites: ['crisis_choice'],
        steps: [
            {
                id: 'buy_solder_kit',
                type: StepType.EVENT,
                event: ITEM_BOUGHT,
                description: 'Купить инструменты',
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
        description: 'Конфликт в SU.FLAME вышел из-под контроля. Вмешайтесь и восстановите мир в эхе.',
        hints: [
            'Изучите переписку в эхоконференции.',
            'Найдите ключевой тред с конфликтом ("War").',
            'Ваши аргументы должны быть убедительны.'
        ],
        prerequisites: ['crisis_choice'],
        steps: [
            {
                id: 'win_flame_war',
                type: StepType.EVENT,
                event: DIALOGUE_COMPLETED,
                description: 'Урегулировать конфликт',
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
        description: 'Ваш авторитет непререкаем. Вы стали легендой локальной сети.',
        hints: [
            'Вы достигли вершины мастерства.',
            'Проверяйте статус и ожидайте новостей.',
            'Возможно, с вами свяжутся.'
        ],
        prerequisites: ['fix_hardware', 'negotiate_peace'], // OR logic handled in engine? No, usually AND. Logic needs dynamic branching.
        steps: [],
        rewards: [{ type: 'stat', key: 'fido_fame', delta: 100 }],
        nextQuest: 'meet_coordinator',
        completesAct: 5,
    }
];
