/**
 * Application Handlers (Games, Utils)
 */

import { eventBus } from '../../events/bus';
import { UI_START_MAIL_TOSSING, UI_OPEN_WINDOW } from '../../events/types';

export function handleDoom({ gameState, dispatch, actions, appendOutput }) {
    const hasDoom = gameState.player?.inventory?.includes('doom2');
    const virusActive = gameState.gameState?.virusActive || false;

    if (!hasDoom) {
        appendOutput("Файл не найден: DOOM2.WAD");
        return { handled: true };
    }

    if (virusActive) {
        appendOutput("Программа уже запущена.");
        return { handled: true };
    }

    appendOutput("Запуск DOOM2.WAD...");
    appendOutput("");

    // Activate virus after short delay
    setTimeout(() => {
        dispatch(actions.setVirusActive(true));
        dispatch(actions.setVirusStage('cascade'));
        dispatch(actions.updateStat({ stat: 'sanity', value: -20 }));
        dispatch(actions.updateStat({ stat: 'atmosphere', value: -10 }));
    }, 1000);

    return { handled: true };
}

export function handleAidstest({ gameState, dispatch, actions, appendOutput }) {
    const virusActive = gameState.gameState?.virusActive || false;

    if (!virusActive) {
        appendOutput("AIDSTEST v1.03 (c) Д.Лозинский");
        appendOutput("Вирусов не обнаружено.");
        return { handled: true };
    }

    appendOutput("Запуск антивируса...");
    appendOutput("");

    // Start cleaning animation
    dispatch(actions.setVirusStage('cleaning'));

    // Complete cleaning after 5 seconds
    setTimeout(() => {
        dispatch(actions.setVirusActive(false));
        dispatch(actions.setVirusStage('none'));
        appendOutput("Система очищена от вирусов.");
        appendOutput("");
    }, 5000);

    return { handled: true };
}

export function handleTMail({ command, appendOutput }) {
    // Check arguments
    const cmdUpper = command.trim().toUpperCase();
    const parts = cmdUpper.split(/\s+/);
    
    // T-MAIL POLL or just POLL
    if ((parts.length > 1 && parts[1] === 'POLL') || cmdUpper === 'POLL') {
        appendOutput("Запуск T-Mail Tossing...");
        eventBus.publish(UI_START_MAIL_TOSSING, {});
        return { handled: true };
    }

    // Default behavior (setup) - controlled by desktop icon usually, but in terminal?
    // In real DOS, T-Mail without args might show help or run tossing if configured.
    // Here we'll just say "Use T-MAIL POLL to exchange mail".
    appendOutput("T-Mail v2605");
    appendOutput("Используйте: T-MAIL POLL для обмена почтой.");
    appendOutput("Или запустите Setup.exe с рабочего стола для настройки.");
    
    return { handled: true };
}

export function handleWork({ dispatch, actions, appendOutput }) {
    const amount = Math.floor(Math.random() * 300) + 300; // 300-600 rub
    appendOutput(`Вы помогли соседу переустановить Windows...`);
    appendOutput(`Заработок: ${amount} руб.`);
    appendOutput(`Время потрачено: 4 часа. Усталость: -10% рассудка.`);
    
    dispatch(actions.updateStat({ stat: 'money', value: amount }));
    dispatch(actions.updateStat({ stat: 'sanity', value: -10 }));
    dispatch(actions.advanceTime('00:00')); // Mock time advance, ideally calculate properly
    
    return { handled: true };
}

export function handleAllowance({ gameState, dispatch, actions, appendOutput }) {
    const day = gameState.gameState?.day || 1;
    // Simple logic: allowance every Monday (day 1, 8, 15...)
    const isMonday = (day - 1) % 7 === 0;
    const atmosphere = gameState.player.stats.atmosphere;
    
    if (isMonday) {
        if (atmosphere > 20) {
            appendOutput(`Родители выдали карманные деньги: 1000 руб.`);
            dispatch(actions.updateStat({ stat: 'money', value: 1000 }));
        } else {
            appendOutput(`Родители злятся (скандал). Денег не дали.`);
        }
    } else {
        appendOutput(`До понедельника еще далеко. Карманных денег нет.`);
    }
    
    return { handled: true };
}

export function handlePay({ gameState, dispatch, actions, appendOutput }) {
    const { debt, money } = gameState.player.stats;
    
    if (debt <= 0) {
        appendOutput("У вас нет задолженностей.");
        return { handled: true };
    }
    
    if (money < debt) {
        appendOutput(`ОШИБКА: Недостаточно средств. Ваш долг: ${debt} руб. Баланс: ${money} руб.`);
        return { handled: true };
    }
    
    dispatch(actions.payBill(debt));
    appendOutput(`Счет оплачен. Сумма: ${debt} руб. Спасибо!`);
    
    return { handled: true };
}

export function handleGoldED({ command, gameState, appendOutput }) {
    const hasGoldED = gameState.player?.inventory?.includes('golded');
    
    if (!hasGoldED) {
         appendOutput("Неверная команда или имя файла");
         return { handled: true };
    }

    const args = command.trim().split(/\s+/).slice(1);
    const arg = args[0]?.toUpperCase();

    if (arg === 'SETUP' || arg === '-SETUP' || arg === '/SETUP') {
        appendOutput("Запуск конфигуратора GoldED...");
        eventBus.publish(UI_OPEN_WINDOW, { windowId: 'golded-config' });
    } else {
        appendOutput("Запуск GoldED 2.50+...");
        eventBus.publish(UI_OPEN_WINDOW, { windowId: 'golded-reader' });
    }
    
    return { handled: true };
}
