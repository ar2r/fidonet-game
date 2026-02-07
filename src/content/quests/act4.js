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
        nextQuest: 'download_binkley',
    },

    {
        id: 'download_binkley',
        act: 4,
        title: 'Скачать BinkleyTerm',
        description: 'Сисоп сказал использовать "серьезный мейлер". Скачайте BinkleyTerm с BBS.',
        hint: 'Подключитесь к BBS и скачайте файл #5 из файловой области.',
        prerequisites: ['request_node'],
        steps: [
            {
                id: 'dl_bt',
                type: StepType.EVENT,
                event: 'download.completed',
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
        title: 'Настройка Ноды',
        description: 'Настройте BinkleyTerm для работы в режиме Ноды.',
        hint: 'Отредактируйте C:\\FIDO\\BT.CFG. Ваш адрес: 2:5020/730. Имя сисопа: SysOp (или ваше). Скорость порта: 19200.',
        prerequisites: ['download_binkley'],
        steps: [
            {
                id: 'save_bt_cfg',
                type: StepType.EVENT,
                event: 'file.saved',
                description: 'Сохранить конфиг BinkleyTerm',
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
        title: 'Ночной Дозвон',
        description: 'Оставьте BinkleyTerm запущенным на ночь (ZMH: 04:00 - 05:00), чтобы принять почту от босса.',
        hint: 'Запустите BinkleyTerm с рабочего стола и ждите наступления 4 утра. Не закрывайте окно!',
        prerequisites: ['configure_binkley'],
        steps: [
            {
                id: 'zmh_session',
                type: StepType.EVENT,
                event: 'zmh.activity.completed',
                description: 'Успешная сессия в ZMH',
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
