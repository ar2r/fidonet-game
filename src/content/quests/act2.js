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
        hint: 'Запустите T-Mail Setup.exe с рабочего стола. Информацию можно получить у Сисопа BBS (команда C в меню) и прочитать README.1ST (команда TYPE C:\\FIDO\\README.1ST).',
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
        hint: 'Запустите GoldED с рабочего стола. Используйте тот же адрес, что и в T-Mail. Origin — это подпись в конце ваших писем.',
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
        nextQuest: null, // TODO: first_poll in Phase 7
        completesAct: 2,
    },
];
