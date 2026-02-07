/**
 * Application Handlers (Games, Utils)
 */

import { eventBus } from '../../events/bus';
import { UI_START_MAIL_TOSSING } from '../../events/types';

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
        dispatch(actions.updateStat({ stat: 'momsPatience', value: -10 }));
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
    const amount = Math.floor(Math.random() * 500) + 100;
    appendOutput(`Вы помогли соседу переустановить Windows...`);
    appendOutput(`Заработок: ${amount} руб.`);
    appendOutput(`Время потрачено: 2 часа`);
    
    dispatch(actions.updateStat({ stat: 'money', value: amount }));
    
    return { handled: true };
}

export function handleAllowance({ gameState, dispatch, actions, appendOutput }) {
    const day = gameState.gameState?.day || 1;
    // Simple logic: allowance every Monday (day 1, 8, 15...)
    const isMonday = (day - 1) % 7 === 0;
    
    if (isMonday) {
        appendOutput(`Родители выдали карманные деньги: 1000 руб.`);
        dispatch(actions.updateStat({ stat: 'money', value: 1000 }));
    } else {
        appendOutput(`До понедельника еще далеко. Карманных денег нет.`);
    }
    
    return { handled: true };
}