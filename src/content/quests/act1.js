/**
 * Act 1 Quests: Коннект
 * Goal: Get online, connect to BBS, download software
 */

import { StepType } from '../../domain/quests/schema';
import { MODEM_INITIALIZED, BBS_CONNECTED, DOWNLOAD_COMPLETED } from '../../domain/events/types';

export const ACT1_QUESTS = [
    {
        id: 'init_modem',
        act: 1,
        title: 'Строка инициализации',
        description: 'Запустите TERMINAL.EXE и инициализируйте модем.',
        hints: [
            'Нужно подготовить модем к работе.',
            'Запустите терминал и введите команду сброса.',
            'Наберите "TERMINAL", затем "ATZ".'
        ],
        prerequisites: [],
        steps: [
            {
                id: 'run_terminal',
                type: StepType.MANUAL,
                description: 'Запустить TERMINAL.EXE',
            },
            {
                id: 'init_modem',
                type: StepType.EVENT,
                event: MODEM_INITIALIZED,
                description: 'Инициализировать модем командой ATZ',
            },
        ],
        rewards: [
            { type: 'skill', key: 'typing', delta: 1 },
        ],
        nextQuest: 'first_connect',
    },

    {
        id: 'first_connect',
        act: 1,
        title: 'Первый Контакт',
        description: 'Подключитесь к BBS The Nexus (555-3389).',
        hints: [
            'Нужно позвонить на BBS.',
            'Используйте команду DIAL и номер телефона.',
            'Наберите "DIAL 555-3389" в терминале.'
        ],
        prerequisites: ['init_modem'],
        steps: [
            {
                id: 'dial_bbs',
                type: StepType.EVENT,
                event: BBS_CONNECTED,
                description: 'Позвонить на BBS The Nexus',
                metadata: {
                    bbs: 'The Nexus',
                },
            },
        ],
        rewards: [
            { type: 'skill', key: 'typing', delta: 1 },
        ],
        nextQuest: 'download_software',
    },

    {
        id: 'download_software',
        act: 1,
        title: 'Скачать софт',
        description: 'Скачайте T-Mail и GoldED из файловой области BBS.',
        hints: [
            'Вам нужны программы для работы с почтой. Ищите их на BBS.',
            'В главном меню нажмите F (Files), затем выберите нужные файлы.',
            'Наберите "F", затем "1" для T-Mail и "2" для GoldED.'
        ],
        prerequisites: ['first_connect'],
        steps: [
            {
                id: 'download_tmail',
                type: StepType.EVENT,
                event: DOWNLOAD_COMPLETED,
                description: 'Скачать T-Mail',
                metadata: {
                    item: 't-mail',
                },
            },
            {
                id: 'download_golded',
                type: StepType.EVENT,
                event: DOWNLOAD_COMPLETED,
                description: 'Скачать GoldED',
                metadata: {
                    item: 'golded',
                },
            },
        ],
        rewards: [
            { type: 'skill', key: 'typing', delta: 1 },
            { type: 'skill', key: 'software', delta: 1 },
        ],
        nextQuest: 'configure_tmail',
        completesAct: 1,
    },
];
