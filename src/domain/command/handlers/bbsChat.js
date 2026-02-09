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
                text: "Архитектор: [CONNECT 14400] Приветствую. Я вижу твой IP... шутка. Что привело тебя в Нексус?",
                options: [
                    { id: 1, text: "Я готов стать частью сети. Хочу свою ноду.", nextStep: 2 },
                    { id: 2, text: "Что это за место?", nextStep: 1 },
                    { id: 3, text: "Просто мимо проходил.", nextStep: 'exit' },
                ]
            },
            {
                text: "Архитектор: Это центральный хаб нашего региона. Мы маршрутизируем почту, держим эхоконференции и не даем ламерам положить сеть. Работы много.",
                options: [
                    { id: 1, text: "Звучит круто. Я хочу помочь (Стать нодой).", nextStep: 2 },
                    { id: 2, text: "Понятно. Ну, удачи.", nextStep: 'exit' }
                ]
            },
            {
                text: "Архитектор: Похвальное рвение. Но нода — это не просто статус в подписи. Это аптайм, это ZMH с 4 до 5 утра, это ответственность.\nАрхитектор: Железо потянет? У тебя есть US Robotics Courier?",
                options: [
                    { id: 1, text: "Обижаешь! Новенький Courier V.Everything.", nextStep: 3 },
                    { id: 2, text: "Ну... у меня есть модем на 2400 бод...", nextStep: 4 },
                    { id: 3, text: "А зачем такой дорогой модем?", nextStep: 5 }
                ]
            },
            {
                text: "Архитектор: [Одобрительный писк модема] Добро пожаловать в семью. Твой адрес: 2:5020/730.\nАрхитектор: Теперь ищи софт. BinkleyTerm — твой выбор.",
                onEnter: () => {
                    eventBus.publish(DIALOGUE_COMPLETED, { dialogueId: 'request_node_status', success: true });
                },
                options: [
                    { id: 1, text: "Спасибо! Пойду настраивать.", nextStep: 'exit' },
                    { id: 2, text: "Служу Фидонету!", nextStep: 'exit' }
                ]
            },
            {
                text: "Архитектор: На 2400 ты будешь качать почту до следующего тысячелетия. Не позорь регион. Купи нормальное железо.",
                onEnter: () => {
                    eventBus.publish(DIALOGUE_COMPLETED, { dialogueId: 'request_node_status', success: false });
                },
                options: [
                    { id: 1, text: "Ладно, ладно. Вернусь с Курьером.", nextStep: 'exit' },
                ]
            },
            {
                text: "Архитектор: Потому что на наших телефонных линиях только Courier может держать стабильный линк. Остальное — мусор. Не трать мое время.",
                options: [
                    { id: 1, text: "Понял. Будет Курьер.", nextStep: 4 },
                    { id: 2, text: "Так он у меня уже есть!", nextStep: 2 }
                ]
            }
        ]
    },
    act3_strategy_dialogue: {
        steps: [
            {
                text: "Архитектор: Видел, что творится в SU.FLAME? Troll.Master.SU совсем озверел. Что думаешь делать?",
                options: [
                    { id: 1, text: "Попробую с ним поговорить. (Путь Дипломата)", nextStep: 1 },
                    { id: 2, text: "Вычислю его адрес и сдам. (Путь Технаря)", nextStep: 2 },
                ]
            },
            {
                text: "Архитектор: Благородно, но рискованно. Если у тебя подвешен язык (Eloquence), дерзай. Напиши в эху.",
                onEnter: (dispatch, actions) => {
                    dispatch(actions.completeQuest('choose_strategy'));
                    dispatch(actions.setActiveQuest('reply_welcome'));
                },
                options: [
                    { id: 1, text: "Понял. Иду в GoldED.", nextStep: 'exit' }
                ]
            },
            {
                text: "Архитектор: Хакерский подход? Мне нравится. Набери в терминале TRACE TROLL.MASTER.SU — увидишь, откуда он на самом деле пишет.",
                onEnter: (dispatch, actions) => {
                    dispatch(actions.completeQuest('choose_strategy'));
                    dispatch(actions.setActiveQuest('trace_troll'));
                },
                options: [
                    { id: 1, text: "Будет сделано.", nextStep: 'exit' }
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
                text: "Troll.Master.SU: ТЫ КТО ТАКОЙ? ВАЛИ ОТСЮДА ПОКА ЦЕЛ! ЛАМЕР!",
                options: [
                    { id: 1, text: "Сам ламер. (Атака)", nextStep: 3 },
                    { id: 2, text: "Давайте успокоимся и обсудим всё конструктивно. (Дипломатия)", nextStep: 1 },
                ]
            },
            {
                text: "User1: Слушайте, он дело говорит. Хватит ругаться.",
                options: [
                    { id: 1, text: "Вот именно. Fidonet — это сеть друзей.", nextStep: 2 },
                ]
            },
            {
                text: "Troll.Master.SU: ...Ладно. Может ты и прав. Скучно с вами.",
                onEnter: () => {
                    eventBus.publish(DIALOGUE_COMPLETED, { dialogueId: 'flame_war_peace', success: true });
                },
                options: [
                    { id: 1, text: "Мир.", nextStep: 'exit' }
                ]
            },
            {
                text: "Troll.Master.SU: АХАХА! СЛИВ ЗАЩИТАН! (Вас забанили)",
                onEnter: () => {
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
    },
    generic_chat: {
        steps: [
            {
                text: "Архитектор: [BUSY] Я сейчас занят настройкой тоссера. Что-то срочное?",
                options: [
                    { id: 1, text: "Как дела в сети?", nextStep: 1 },
                    { id: 2, text: "Нет, просто проверяю связь.", nextStep: 'exit' },
                ]
            },
            {
                text: "Архитектор: Трафик растет. Ламеры флеймят. Сисопы пьют пиво. Все как обычно. Не забивай линию, если нет дела.",
                options: [
                    { id: 1, text: "Понял. Отбой.", nextStep: 'exit' }
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
    const quests = gameState.quests;

    let dialogueId = network.activeDialogue;
    let stepIdx = network.dialogueStep;
    let isInitializing = false;

    // Initialize dialogue if not active
    if (!dialogueId) {
        isInitializing = true;
        dialogueId = 'default';
        
        // Context-aware dialogue selection
        if (quests.active === 'request_node') {
            dialogueId = 'request_node_status';
        } else if (quests.active === 'choose_strategy') {
            dialogueId = 'act3_strategy_dialogue';
        } else if (quests.active === 'crisis_choice') {
            dialogueId = 'crisis_dialogue';
        } else if (quests.active === 'negotiate_peace') {
            dialogueId = 'flame_war_peace';
        } else if (quests.active === 'meet_coordinator') {
            dialogueId = 'coordinator_finale';
        }

        if (dialogueId === 'default') {
            // Check for specific quest hints or fallback to generic chat
            if (quests.active === 'hardware_upgrade') {
                dispatch(actions.setTerminalMode('BBS_MENU'));
                if (actions.setOptions) dispatch(actions.setOptions([]));
                appendOutput("");
                appendOutput("Архитектор сейчас занят. Заходите позже.");
                appendOutput("(Подсказка: Сначала выполните квест 'Железный вопрос' - купите модем)");
                appendOutput("");
                appendOutput(BBS_MENU);
                return { handled: true };
            }
            
            // Use generic chat instead of immediate exit
            dialogueId = 'generic_chat';
        }
        
        stepIdx = 0;
    }

    // Try to match command against current step options
    const dialogue = DIALOGUES[dialogueId];
    const currentStep = dialogue.steps[stepIdx];
    
    let option = null;
    const choice = parseInt(command);
    const normalizedCmd = command.trim().toLowerCase();
    
    if (normalizedCmd) {
        if (!isNaN(choice)) {
            option = currentStep.options.find(o => o.id === choice);
        } else {
            // Try fuzzy text matching
            option = currentStep.options.find(o => o.text.toLowerCase().includes(normalizedCmd));
        }
    }

    // If we found a valid option, execute it
    if (option) {
        if (option.nextStep === 'exit') {
            dispatch(actions.setDialogue({ id: null, step: 0 }));
            dispatch(actions.setTerminalMode('BBS_MENU'));
            appendOutput("");
            appendOutput("Архитектор: Бывай.");
            appendOutput("");
            appendOutput(BBS_MENU);
            return { handled: true };
        } else {
            const nextStepIdx = option.nextStep;
            const nextStep = dialogue.steps[nextStepIdx];
            
            dispatch(actions.setDialogue({ id: dialogueId, step: nextStepIdx }));
            
            if (nextStep.onEnter) {
                nextStep.onEnter(dispatch, actions);
            }
            
            renderStep(nextStep, appendOutput);
            return { handled: true };
        }
    }

    // If no option matched...
    
    if (isInitializing) {
        // Just started, show the first step
        dispatch(actions.setDialogue({ id: dialogueId, step: 0 }));
        renderStep(currentStep, appendOutput);
    } else {
        // Was already active, but input was invalid
        appendOutput(`Непонятно. Выберите вариант (${currentStep.options.map(o => o.id).join(', ')}) или напишите ключевое слово.`);
    }

    return { handled: true };
}

/**
 * Start chat dialogue immediately (used by BBS menu)
 */
export function startChat({ gameState, dispatch, actions, appendOutput }) {
    const quests = gameState.quests;

    let dialogueId = 'default';
        
    // Context-aware dialogue selection
    if (quests.active === 'request_node') {
        dialogueId = 'request_node_status';
    } else if (quests.active === 'choose_strategy') {
        dialogueId = 'act3_strategy_dialogue';
    } else if (quests.active === 'crisis_choice') {
        dialogueId = 'crisis_dialogue';
    } else if (quests.active === 'negotiate_peace') {
        dialogueId = 'flame_war_peace';
    } else if (quests.active === 'meet_coordinator') {
        dialogueId = 'coordinator_finale';
    }

    if (dialogueId === 'default') {
        // Check for specific quest hints or fallback to generic chat
        if (quests.active === 'hardware_upgrade') {
            dispatch(actions.setTerminalMode('BBS_MENU'));
            appendOutput("");
            appendOutput("Архитектор сейчас занят. Заходите позже.");
            appendOutput("(Подсказка: Сначала выполните квест 'Железный вопрос' - купите модем)");
            appendOutput("");
            appendOutput(BBS_MENU);
            return;
        }
        
        // Use generic chat instead of immediate exit
        dialogueId = 'generic_chat';
    }

    // Start the dialogue
    dispatch(actions.setDialogue({ id: dialogueId, step: 0 }));
    
    // Render first step
    const dialogue = DIALOGUES[dialogueId];
    const currentStep = dialogue.steps[0];
    renderStep(currentStep, appendOutput);
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