/**
 * Act 3 Quests: Почта и Флейм
 * Goal: Poll Boss Node, Read Rules, Participate (Branching)
 */

import { StepType } from '../../domain/quests/schema';
import { MAIL_TOSSING_COMPLETED, MESSAGE_READ, MESSAGE_POSTED, DIALOGUE_COMPLETED, COMMAND_EXECUTED } from '../../domain/events/types';

export const ACT3_QUESTS = [
    {
        id: 'poll_boss',
        act: 3,
        title: 'Первая Прозвонка',
        description: 'Все системы настроены. Необходимо инициировать сеанс связи с боссом для получения свежей почты.',
        hints: [
            'Для обмена почтой используется процедура Poll.',
            'Это можно сделать из командной строки мейлера или через меню.',
            'Команда POLL инициирует дозвон.'
        ],
        prerequisites: ['configure_golded'],
        steps: [
            {
                id: 'run_poll',
                type: StepType.EVENT,
                event: MAIL_TOSSING_COMPLETED,
                description: 'Выполнить обмен почтой',
            },
        ],
        rewards: [
            { type: 'skill', key: 'software', delta: 1 },
            { type: 'item', item: 'mail_packet', delta: 1 },
        ],
        nextQuest: 'read_rules',
    },

    {
        id: 'read_rules',
        act: 3,
        title: 'Устав монастыря',
        description: 'Прежде чем писать, изучите правила эхоконференции SU.FLAME.',
        hints: [
            'Запустите редактор сообщений (GoldED).',
            'Выберите область SU.FLAME в списке эхоконференций и нажмите Enter.',
            'Найдите письмо от модератора с правилами и прочитайте его.'
        ],
        prerequisites: ['poll_boss'],
        steps: [
            {
                id: 'read_su_flame_rules',
                type: StepType.EVENT,
                event: MESSAGE_READ,
                description: 'Прочитать правила SU.FLAME',
                metadata: {
                    area: 'su_flame',
                    subj_contains: 'Rules',
                },
            },
        ],
        rewards: [
            { type: 'skill', key: 'reading', delta: 1 },
            { type: 'stat', key: 'sanity', delta: 5 },
        ],
        nextQuest: 'choose_strategy',
    },

    {
        id: 'choose_strategy',
        act: 3,
        title: 'Выбор Стратегии',
        description: 'В эхе SU.FLAME разгорается конфликт. Вам предстоит решить, какую сторону занять: дипломатии или силы.',
        hints: [
            'Это сюжетный выбор, определяющий ваш стиль игры.',
            'Путь Дипломата: Написать вежливое письмо в эху SU.FLAME.',
            'Путь Техника: Вычислить обидчика с помощью сетевой утилиты TRACE.'
        ],
        prerequisites: ['read_rules'],
        steps: [
            {
                id: 'make_choice',
                type: StepType.MANUAL,
                description: 'Выбрать путь',
            }
        ],
        rewards: [],
        nextQuest: null, // Dynamic: 'reply_welcome' or 'trace_troll'
    },

    // Diplomat Path
    {
        id: 'reply_welcome',
        act: 3,
        title: 'Глас Разума',
        description: 'Попробуйте успокоить участников конференции вежливым приветствием.',
        hints: [
            'Зайдите в эху SU.FLAME и нажмите клавишу "n" для создания нового письма.',
            'Напишите вежливое сообщение и нажмите Ctrl+Enter для отправки.',
            'Вместо нового письма можно ответить кому-то, нажав клавишу "r".'
        ],
        prerequisites: ['choose_strategy'],
        steps: [
            {
                id: 'post_hello',
                type: StepType.EVENT,
                event: MESSAGE_POSTED,
                description: 'Написать сообщение в SU.FLAME',
                metadata: {
                    area: 'su_flame',
                },
            },
        ],
        rewards: [
            { type: 'skill', key: 'eloquence', delta: 3 },
            { type: 'stat', key: 'fido_fame', delta: 2 },
            { type: 'stat', key: 'karma', delta: 5 },
        ],
        nextQuest: 'hardware_upgrade',
        completesAct: 3,
    },

    // Technician Path
    {
        id: 'trace_troll',
        act: 3,
        title: 'Охота на Тролля',
        description: 'Тролль скрывается за поддельными адресами. Вычислите его настоящий узел.',
        hints: [
            'Вам понадобятся сетевые утилиты.',
            'Команда трассировки (TRACE) поможет найти источник.',
            'Цель: TROLL.MASTER.'
        ],
        prerequisites: ['choose_strategy'],
        steps: [
            {
                id: 'exec_trace',
                type: StepType.EVENT,
                event: COMMAND_EXECUTED, // Need to implement TRACE command
                description: 'Вычислить узел Troll.Master',
                metadata: {
                    command: 'TRACE',
                    args: 'TROLL.MASTER'
                }
            }
        ],
        rewards: [
            { type: 'skill', key: 'software', delta: 3 },
            { type: 'stat', key: 'fido_fame', delta: 1 }, // Less fame but more skill
        ],
        nextQuest: 'hardware_upgrade',
        completesAct: 3,
    }
];