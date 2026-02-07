/**
 * Act 3 Quests: Почта и Флейм
 * Goal: Poll Boss Node, Read Rules, Participate
 */

import { StepType } from '../../domain/quests/schema';
import { BBS_CONNECTED } from '../../domain/events/types'; // We might need a new event for POLL

// Custom event for successful poll
const MAIL_TOSSING_COMPLETED = 'mail.tossed';
// Custom event for opening a message
const MESSAGE_READ = 'message.read';
// Custom event for posting a message
const MESSAGE_POSTED = 'message.posted';

export const ACT3_QUESTS = [
    {
        id: 'poll_boss',
        act: 3,
        title: 'Первая Прозвонка',
        description: 'Сделайте Poll (прозвонку) на босс-ноду, чтобы получить свежую почту.',
        hint: 'Запустите T-Mail Poll через терминал (наберите T-MAIL POLL) или найдите кнопку Poll в меню BBS/Setup.',
        prerequisites: ['configure_golded'],
        steps: [
            {
                id: 'run_poll',
                type: StepType.EVENT,
                event: MAIL_TOSSING_COMPLETED,
                description: 'Выполнить обмен почтой (Tossing)',
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
        title: 'Чтение Правил',
        description: 'Откройте GoldED и прочитайте правила эхоконференции SU.FLAME.',
        hint: 'Запустите GoldED, выберите область SU.FLAME, найдите сообщение от SysOp с темой "Rules".',
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
        nextQuest: 'reply_welcome',
    },

    {
        id: 'reply_welcome',
        act: 3,
        title: 'Приветствие',
        description: 'Напишите приветственное сообщение в SU.FLAME.',
        hint: 'В GoldED, находясь в SU.FLAME, нажмите Insert (или New Msg) и отправьте письмо.',
        prerequisites: ['read_rules'],
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
            { type: 'skill', key: 'typing', delta: 2 },
            { type: 'stat', key: 'fido_fame', delta: 1 },
        ],
        nextQuest: null, // End of Act 3 (for now)
        completesAct: 3,
    },
];
