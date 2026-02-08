/**
 * Act 2 Quests: Настройка
 * Goal: Configure T-Mail and GoldED
 */

import { StepType } from '../../domain/quests/schema';
import { FILE_SAVED } from '../../domain/events/types';

export const ACT2_QUESTS = [
    {
        id: 'configure_tmail',
        act: 2,
        title: 'Настройка почты',
        description: 'Почтовый мейлер требует настройки перед использованием. Введите сетевые параметры вашей станции и босса.',
        hints: [
            'Для настройки используйте специальную утилиту (Setup).',
            'Ваш адрес пойнта: 2:5020/730.15. Адрес босс-ноды: 2:5020/730.',
            'Телефон босса: 555-3389. Пароль на сессию: secret.'
        ],
        prerequisites: ['download_software'],
        steps: [
            {
                id: 'open_tmail_setup',
                type: StepType.MANUAL,
                description: 'Запустить конфигуратор T-Mail',
            },
            {
                id: 'save_valid_config',
                type: StepType.EVENT,
                event: FILE_SAVED,
                description: 'Сохранить корректную конфигурацию',
                metadata: {
                    path: 'C:\\FIDO\\T-MAIL.CTL',
                    validator: 'tmail.valid',
                },
            },
        ],
        rewards: [
            { type: 'skill', key: 'software', delta: 2 },
            { type: 'skill', key: 'typing', delta: 1 },
        ],
        nextQuest: 'configure_golded',
    },

    {
        id: 'configure_golded',
        act: 2,
        title: 'Личность в сети',
        description: 'Настройте редактор сообщений. Сеть должна знать ваше имя и адрес для правильной подписи писем.',
        hints: [
            'Запустите настройку редактора GoldED.',
            'Укажите тот же адрес, что и в мейлере (2:5020/730.15).',
            'Не забудьте заполнить поле Origin — это ваша визитная карточка.'
        ],
        prerequisites: ['configure_tmail'],
        steps: [
            {
                id: 'open_golded',
                type: StepType.MANUAL,
                description: 'Запустить редактор сообщений',
            },
            {
                id: 'save_golded_config',
                type: StepType.EVENT,
                event: FILE_SAVED,
                description: 'Сохранить настройки редактора',
                metadata: {
                    path: 'C:\\FIDO\\GOLDED.CFG',
                    validator: 'golded.valid',
                },
            },
        ],
        rewards: [
            { type: 'skill', key: 'software', delta: 2 },
            { type: 'skill', key: 'typing', delta: 1 },
        ],
        nextQuest: 'poll_boss',
        completesAct: 2,
    },
];
