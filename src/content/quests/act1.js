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
        description: 'Для выхода в сеть необходимо подготовить оборудование. Запустите терминал и инициализируйте модем.',
        hints: [
            'Вам нужно попасть в командную строку терминала.',
            'Модемы управляются специальными AT-командами.',
            'Попробуйте команду сброса (обычно это Z).'
        ],
        prerequisites: [],
        steps: [
            {
                id: 'run_terminal',
                type: StepType.MANUAL,
                description: 'Запустить терминальную программу',
            },
            {
                id: 'init_modem',
                type: StepType.EVENT,
                event: MODEM_INITIALIZED,
                description: 'Выполнить инициализацию модема',
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
        description: 'Найден номер местной BBS "The Nexus" (5553389). Попробуйте установить соединение.',
        hints: [
            'Используйте команду набора номера.',
            'Не забудьте указать телефонный номер BBS.',
            'Команда DIAL поможет вам дозвониться.'
        ],
        prerequisites: ['init_modem'],
        steps: [
            {
                id: 'dial_bbs',
                type: StepType.EVENT,
                event: BBS_CONNECTED,
                description: 'Установить соединение с BBS The Nexus',
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
        title: 'Необходимый софт',
        description: 'Для работы в сети FidoNet вам понадобятся почтовый мейлер и редактор сообщений. Найдите их на BBS.',
        hints: [
            'Изучите меню BBS. Обычно файлы находятся в разделе Files.',
            'Вам нужны программы T-Mail и GoldED.',
            'Скачайте архивы с этими программами.'
        ],
        prerequisites: ['first_connect'],
        steps: [
            {
                id: 'download_tmail',
                type: StepType.EVENT,
                event: DOWNLOAD_COMPLETED,
                description: 'Скачать почтовый мейлер (T-Mail)',
                metadata: {
                    item: 't-mail',
                },
            },
            {
                id: 'download_golded',
                type: StepType.EVENT,
                event: DOWNLOAD_COMPLETED,
                description: 'Скачать редактор сообщений (GoldED)',
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
