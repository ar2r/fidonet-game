import { completeQuestAndProgress } from './completion';
import { validateTMailConfig, checkConfigCorrectness } from '../../engine/configValidator';
import { eventBus } from '../events/bus';
import { FILE_SAVED } from '../events/types';

/**
 * Quest Service
 * Handles quest completion logic independently of UI
 */

/**
 * Handle T-Mail config save and quest completion
 * @param {Object} config - T-Mail configuration
 * @param {Object} fileSystem - FileSystem instance
 * @param {Object} questState - Current quest state from Redux
 * @param {Function} dispatch - Redux dispatch
 * @param {Object} actions - Redux actions
 * @returns {{success: boolean, error?: string}}
 */
export function handleTMailConfigComplete(config, fileSystem, questState, dispatch, actions) {
    // Validate config format
    const validation = validateTMailConfig(config, fileSystem);
    if (!validation.valid) {
        return { success: false, error: validation.errors.join('\n') };
    }

    // Check if config matches correct values
    const correctness = checkConfigCorrectness(config);
    if (!correctness.correct) {
        return {
            success: false,
            error: 'Конфигурация заполнена, но содержит ошибки.\nПроверьте адрес, пароль и телефон.'
        };
    }

    // Complete quest if active
    if (questState.active === 'configure_tmail') {
        completeQuestAndProgress('configure_tmail', dispatch, actions);
    }

    // Publish file.saved event
    eventBus.publish(FILE_SAVED, {
        path: 'C:\\FIDO\\T-MAIL.CTL',
        valid: true,
    });

    return { success: true };
}

/**
 * Handle GoldED config save and quest completion
 * @param {Object} config - GoldED configuration
 * @param {Object} questState - Current quest state from Redux
 * @param {Function} dispatch - Redux dispatch
 * @param {Object} actions - Redux actions
 * @returns {{success: boolean, error?: string, triggerAnimation?: boolean}}
 */
export function handleGoldEDConfigComplete(config, questState, dispatch, actions) {
    // Basic validation
    if (!config.username || !config.username.trim()) {
        return { success: false, error: 'ОШИБКА: Не указано имя пользователя' };
    }
    if (!config.address || !config.address.trim()) {
        return { success: false, error: 'ОШИБКА: Не указан FidoNet адрес' };
    }

    // Complete quest if active
    let triggerAnimation = false;
    if (questState.active === 'configure_golded') {
        completeQuestAndProgress('configure_golded', dispatch, actions);
        triggerAnimation = true; // Signal to trigger mail tossing animation
    }

    // Publish file.saved event
    eventBus.publish(FILE_SAVED, {
        path: 'C:\\FIDO\\GOLDED.CFG',
        valid: true,
    });

    return { success: true, triggerAnimation };
}

/**
 * Handle BinkleyTerm config save and quest completion
 * @param {Object} config - BinkleyTerm configuration
 * @param {Object} questState - Current quest state from Redux
 * @param {Function} dispatch - Redux dispatch
 * @param {Object} actions - Redux actions
 * @returns {{success: boolean, error?: string}}
 */
export function handleBinkleyConfigComplete(config, questState, dispatch, actions) {
    // Specific requirements for Node status (from Act 4 dialogue)
    if (config.address !== '2:5020/730') {
        return { success: false, error: 'ОШИБКА: Неверный адрес! Сисоп выдал вам 2:5020/730.' };
    }
    
    // Check speed
    const speed = parseInt(config.baudRate);
    if (isNaN(speed) || speed < 19200) {
        return { success: false, error: 'ОШИБКА: Скорость порта слишком низкая для ноды!' };
    }

    // Complete quest if active
    if (questState.active === 'configure_binkley') {
        completeQuestAndProgress('configure_binkley', dispatch, actions);
    }

    // Publish file.saved event
    eventBus.publish(FILE_SAVED, {
        path: 'C:\\FIDO\\BT.CFG',
        valid: true,
    });

    return { success: true };
}

/**
 * Check if file save should trigger quest completion
 * Generic function for future file-based quest steps
 * @param {string} filePath - Path of saved file
 * @param {Object} questState - Current quest state
 * @returns {boolean}
 */
export function shouldCompleteQuestOnFileSave(filePath, questState) {
    const { active } = questState;

    if (active === 'configure_tmail' && filePath === 'C:\\FIDO\\T-MAIL.CTL') {
        return true;
    }
    if (active === 'configure_golded' && filePath === 'C:\\FIDO\\GOLDED.CFG') {
        return true;
    }

    return false;
}
