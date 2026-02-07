/**
 * BBS Chat Mode Handler
 * Handles dialogue with SysOp
 */

import { BBS_MENU } from '../../../assets/ascii';
import { eventBus } from '../../events/bus';
import { DIALOGUE_COMPLETED } from '../../events/types';

const DIALOGUES = {
    request_node_status: {
        steps: [
            {
                text: "Архитектор: Привет. Что-то хотел или просто так зашел?",
                options: [
                    { id: 1, text: "Хочу подать заявку на статус ноды.", nextStep: 1 },
                    { id: 2, text: "Просто зашел поздороваться.", nextStep: 'exit' },
                ]
            },
            {
                text: "Архитектор: Нода — это большая ответственность. Ты должен быть онлайн каждую ночь с 4 до 5 утра (ZMH).\nАрхитектор: У тебя есть US Robotics Courier?",
                options: [
                    { id: 1, text: "Да, я как раз недавно купил отличный Courier 28.8k!", nextStep: 2 },
                    { id: 2, text: "Нет пока, но планирую.", nextStep: 3 },
                ]
            },
            {
                text: "Архитектор: Отлично. Твой FidoNet адрес будет 2:5020/730. Поздравляю в сети!\nАрхитектор: Теперь тебе нужно настроить серьезный мейлер, например BinkleyTerm.",
                onEnter: (dispatch, actions) => {
                    eventBus.publish(DIALOGUE_COMPLETED, { dialogueId: 'request_node_status', success: true });
                },
                options: [
                    { id: 1, text: "Спасибо! Я не подведу.", nextStep: 'exit' },
                ]
            },
            {
                text: "Архитектор: С 'недо-модемами' даже не подходи ко мне. Настрой сначала железо.",
                onEnter: (dispatch, actions) => {
                    eventBus.publish(DIALOGUE_COMPLETED, { dialogueId: 'request_node_status', success: false });
                },
                options: [
                    { id: 1, text: "Понял, вернусь позже.", nextStep: 'exit' },
                ]
            }
        ]
    },
    crisis_dialogue: {
        steps: [
            {
                text: "Архитектор: Ситуация критическая. Шум на линии забивает половину пакетов, а в SU.FLAME началась настоящая война. Ноды отваливаются.",
                options: [
                    { id: 1, text: "Я могу собрать фильтр и почистить линию. (Путь Технаря)", nextStep: 1 },
                    { id: 2, text: "Я попробую успокоить народ в эхе. (Путь Дипломата)", nextStep: 2 },
                ]
            },
            {
                text: "Архитектор: Хорошо. Если ты шаришь в железе — действуй. Тебе понадобится паяльник.",
                onEnter: (dispatch, actions) => {
                    // Manually switch quest branch
                    dispatch(actions.completeQuest('crisis_choice'));
                    dispatch(actions.setActiveQuest('fix_hardware'));
                },
                options: [
                    { id: 1, text: "Уже бегу на рынок.", nextStep: 'exit' }
                ]
            },
            {
                text: "Архитектор: Смело. Там сейчас такое пекло... Если сможешь их успокоить, я буду впечатлен.",
                onEnter: (dispatch, actions) => {
                    // Manually switch quest branch
                    dispatch(actions.completeQuest('crisis_choice'));
                    dispatch(actions.setActiveQuest('negotiate_peace'));
                },
                options: [
                    { id: 1, text: "Я найду нужные слова.", nextStep: 'exit' }
                ]
            }
        ]
    },
    flame_war_peace: {
        steps: [
            {
                text: "Troll.Master: ТЫ КТО ТАКОЙ? ВАЛИ ОТСЮДА ПОКА ЦЕЛ! ЛАМЕР!",
                options: [
                    { id: 1, text: "Сам ламер. (Атака)", nextStep: 3 },
                    { id: 2, text: "Давайте успокоимся и обсудим всё конструктивно. (Дипломатия)", nextStep: 1 },
                ]
            },
            {
                text: "User1: Слушайте, он дело говорит. Хватит ругаться.",
                options: [
                    { id: 1, text: "Вот именно. Фидонет — это сеть друзей.", nextStep: 2 },
                ]
            },
            {
                text: "Troll.Master: ...Ладно. Может ты и прав. Скучно с вами.",
                onEnter: (dispatch, actions) => {
                    eventBus.publish(DIALOGUE_COMPLETED, { dialogueId: 'flame_war_peace', success: true });
                },
                options: [
                    { id: 1, text: "Мир.", nextStep: 'exit' }
                ]
            },
            {
                text: "Troll.Master: АХАХА! СЛИВ ЗАЩИТАН! (Вас забанили)",
                onEnter: (dispatch, actions) => {
                    eventBus.publish(DIALOGUE_COMPLETED, { dialogueId: 'flame_war_peace', success: false });
                },
                options: [
                    { id: 1, text: "...", nextStep: 'exit' }
                ]
            }
        ]
    },
    coordinator_finale: {
        steps: [
            {
                text: "RC5020: Приветствую, Super SysOp. Я наслышан о твоих подвигах. Ты быстро поднялся.",
                options: [
                    { id: 1, text: "Я просто делал свою работу.", nextStep: 1 },
                    { id: 2, text: "Да, я лучший.", nextStep: 2 },
                ]
            },
            {
                text: "RC5020: Скромность украшает. Мы ищем нового координатора на твой сектор. Ты готов?",
                options: [
                    { id: 1, text: "Всегда готов!", nextStep: 3 },
                ]
            },
            {
                text: "RC5020: Амбициозно. Но нам нужны лидеры. Докажи, что ты достоин.",
                options: [
                    { id: 1, text: "Посмотрите на мой аптайм и карму.", nextStep: 3 },
                ]
            },
            {
                text: "RC5020: Хм... Впечатляет. Добро пожаловать в элиту. Теперь ты - Координатор.",
                onEnter: (dispatch, actions) => {
                    eventBus.publish(DIALOGUE_COMPLETED, { dialogueId: 'coordinator_finale', success: true });
                    dispatch(actions.setRank('Coordinator'));
                },
                options: [
                    { id: 1, text: "Спасибо! (Конец игры)", nextStep: 'exit' }
                ]
            }
        ]
    }
};

/**
 * Handle input in chat mode
 */
export function handleChatInput({ command, gameState, dispatch, actions, appendOutput }) {
    const network = gameState.network;
    const player = gameState.player;
    const quests = gameState.quests;

    // Initialize dialogue if not active
    if (!network.activeDialogue) {
        let dialogueId = 'default';
        
        // Context-aware dialogue selection
        if (quests.active === 'request_node') {
            dialogueId = 'request_node_status';
        } else if (quests.active === 'crisis_choice') {
            dialogueId = 'crisis_dialogue';
        } else if (quests.active === 'negotiate_peace') {
            dialogueId = 'flame_war_peace';
        } else if (quests.active === 'meet_coordinator') {
            dialogueId = 'coordinator_finale';
        }

        if (dialogueId === 'default') {
            dispatch(actions.setTerminalMode('BBS_MENU'));
            appendOutput("");
            appendOutput("Архитектор сейчас занят. Заходите позже.");
            appendOutput("");
            appendOutput(BBS_MENU);
            return { handled: true };
        }

        dispatch(actions.setDialogue({ id: dialogueId, step: 0 }));
        renderStep(DIALOGUES[dialogueId].steps[0], appendOutput);
        return { handled: true };
    }

    // Handle option selection
    const dialogue = DIALOGUES[network.activeDialogue];
    const currentStep = dialogue.steps[network.dialogueStep];
    
    const choice = parseInt(command);
    const option = currentStep.options.find(o => o.id === choice);

    if (!option) {
        appendOutput("Выберите один из вариантов: " + currentStep.options.map(o => o.id).join(', '));
        return { handled: true };
    }

    if (option.nextStep === 'exit') {
        dispatch(actions.setDialogue({ id: null, step: 0 }));
        dispatch(actions.setTerminalMode('BBS_MENU'));
        appendOutput("");
        appendOutput("Архитектор: Бывай.");
        appendOutput("");
        appendOutput(BBS_MENU);
    } else {
        const nextStepIdx = option.nextStep;
        const nextStep = dialogue.steps[nextStepIdx];
        
        dispatch(actions.setDialogue({ id: network.activeDialogue, step: nextStepIdx }));
        
        if (nextStep.onEnter) {
            nextStep.onEnter(dispatch, actions);
        }
        
        renderStep(nextStep, appendOutput);
    }

    return { handled: true };
}

function renderStep(step, appendOutput) {
    appendOutput("");
    appendOutput(step.text);
    appendOutput("");
    step.options.forEach(opt => {
        appendOutput(`  ${opt.id}. ${opt.text}`);
    });
    appendOutput("");
    appendOutput("Ваш выбор: ");
}