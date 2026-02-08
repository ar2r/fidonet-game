/**
 * Act 4 Quests: Апгрейд
 * Goal: Buy hardware, Become a Node
 */

import { StepType } from '../../domain/quests/schema';
import { ITEM_BOUGHT, DIALOGUE_COMPLETED, DOWNLOAD_COMPLETED, FILE_SAVED, ZMH_ACTIVITY_COMPLETED } from '../../domain/events/types';

export const ACT4_QUESTS = [
    {
        id: 'hardware_upgrade',
        act: 4,
        title: 'Железный вопрос',
        description: 'Для работы в качестве ноды текущего оборудования недостаточно. Найдите модем, достойный профессионала.',
        hints: [
            'Посетите Радиорынок.',
            'Вам нужен быстрый модем (28800).',
            'Легендарный US Robotics Courier — лучший выбор.'
        ],
        prerequisites: ['reply_welcome'],
        steps: [
            {
                id: 'buy_modem',
                type: StepType.EVENT,
                event: ITEM_BOUGHT,
                description: 'Приобрести скоростной модем',
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
        description: 'Вы готовы к ответственности. Свяжитесь с Сисопом (Архитектором) и подайте заявку на статус Ноды.',
        hints: [
            'Свяжитесь с администрацией через чат.',
            'Вам нужно убедить Архитектора.',
            'Используйте команду CHAT.'
        ],
        prerequisites: ['hardware_upgrade'],
        steps: [
            {
                id: 'talk_to_sysop',
                type: StepType.EVENT,
                event: DIALOGUE_COMPLETED,
                description: 'Получить одобрение на статус ноды',
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
        nextQuest: 'download_binkley',
    },

    {
        id: 'download_binkley',
        act: 4,
        title: 'Инструментарий',
        description: 'Для управления нодой требуется профессиональное ПО. Найдите рекомендованный мейлер на BBS.',
        hints: [
            'Обычный терминал не подойдет для автоматической работы.',
            'Ищите BinkleyTerm в файловой области.',
            'Это файл номер 5.'
        ],
        prerequisites: ['request_node'],
        steps: [
            {
                id: 'dl_bt',
                type: StepType.EVENT,
                event: DOWNLOAD_COMPLETED,
                description: 'Скачать BinkleyTerm',
                metadata: {
                    item: 'binkley',
                },
            },
        ],
        rewards: [
            { type: 'skill', key: 'software', delta: 1 },
        ],
        nextQuest: 'configure_binkley',
    },

    {
        id: 'configure_binkley',
        act: 4,
        title: 'Настройка станции',
        description: 'Настройте BinkleyTerm для автономной работы. Учтите новые параметры порта и скорости.',
        hints: [
            'Отредактируйте конфигурационный файл BT.CFG.',
            'Адрес ноды: 2:5020/730. Скорость порта: 19200.',
            'Используйте COM2 для подключения.'
        ],
        prerequisites: ['download_binkley'],
        steps: [
            {
                id: 'save_bt_cfg',
                type: StepType.EVENT,
                event: FILE_SAVED,
                description: 'Сохранить настройки BinkleyTerm',
                metadata: {
                    path: 'C:\\FIDO\\BT.CFG',
                    validator: 'binkley.valid',
                },
            },
        ],
        rewards: [
            { type: 'skill', key: 'software', delta: 3 },
            { type: 'item', item: 'node_status', delta: 1 },
        ],
        nextQuest: 'nightly_uptime',
    },

    {
        id: 'nightly_uptime',
        act: 4,
        title: 'Звонкий час',
        description: 'Проверьте надежность станции. Она должна быть доступна в Золотой Час Системного Оператора (ZMH).',
        hints: [
            'Оставьте станцию включенной на ночь.',
            'Время ZMH: с 04:00 до 05:00.',
            'Программа должна работать в автоматическом режиме.'
        ],
        prerequisites: ['configure_binkley'],
        steps: [
            {
                id: 'zmh_session',
                type: StepType.EVENT,
                event: ZMH_ACTIVITY_COMPLETED,
                description: 'Отработать сессию в ZMH',
            },
        ],
        rewards: [
            { type: 'stat', key: 'fido_fame', delta: 20 },
            { type: 'skill', key: 'hardware', delta: 1 },
        ],
        nextQuest: null, // Act 4 Complete!
        completesAct: 4,
    },
];
