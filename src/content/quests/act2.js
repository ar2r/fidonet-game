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
        title: 'Настройка T-Mail',
        description: 'Настройте T-Mail: заполните адрес, пароль, босс-ноду.',
        hints: [
            'Для работы почты нужно настроить программу T-Mail.',
            'Запустите T-Mail Setup.exe с рабочего стола.',
            'Адрес: 2:5020/730.15, Босс: 2:5020/730, Телефон: 555-3389, Пароль: secret.'
        ],
        prerequisites: ['download_software'],
        steps: [
            {
                id: 'open_tmail_setup',
                type: StepType.MANUAL,
                description: 'Открыть T-Mail Setup',
            },
            {
                id: 'save_valid_config',
                type: StepType.EVENT,
                event: FILE_SAVED,
                description: 'Сохранить корректную конфигурацию T-Mail',
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
        title: 'Настройка GoldED',
        description: 'Настройте GoldED: укажите имя, адрес и Origin.',
        hints: [
            'Нужно настроить редактор сообщений.',
            'Запустите GoldED Setup с рабочего стола.',
            'Используйте адрес 2:5020/730.15 и укажите ваше имя и Origin.'
        ],
        prerequisites: ['configure_tmail'],
        steps: [
            {
                id: 'open_golded',
                type: StepType.MANUAL,
                description: 'Открыть GoldED',
            },
            {
                id: 'save_golded_config',
                type: StepType.EVENT,
                event: FILE_SAVED,
                description: 'Сохранить конфигурацию GoldED',
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
