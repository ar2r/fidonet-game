/**
 * Quest Step Validators
 * Domain-specific validation functions for quest steps
 */

import { validateTMailConfig, checkConfigCorrectness } from '../../engine/configValidator';

/**
 * Validator registry
 * Maps validator names to validation functions
 */
export const VALIDATORS = {
    'tmail.valid': validateTMailConfigStep,
    'golded.valid': validateGoldEDConfigStep,
    'file.exists': validateFileExists,
    'inventory.has': validateInventoryHas,
};

/**
 * Validate T-Mail config step
 * Checks if T-Mail config is valid and correct
 *
 * @param {Object} context - Validation context
 * @param {Object} context.event - Domain event that triggered validation
 * @param {Object} context.state - Current game state
 * @param {Object} context.fileSystem - FileSystem instance
 * @returns {boolean}
 */
function validateTMailConfigStep(context) {
    const { event, state, fileSystem } = context;

    // Check if config file was saved
    if (event.type !== 'file.saved' || event.path !== 'C:\\FIDO\\T-MAIL.CTL') {
        return false;
    }

    // Read saved config
    const configFile = fileSystem.cat('C:\\FIDO\\T-MAIL.CTL');
    if (!configFile.ok) {
        return false;
    }

    // Parse config
    const config = parseTMailConfig(configFile.content);

    // Validate format
    const validation = validateTMailConfig(config, fileSystem);
    if (!validation.valid) {
        return false;
    }

    // Check correctness
    const correctness = checkConfigCorrectness(config);
    return correctness.correct;
}

/**
 * Validate GoldED config step
 * Checks if GoldED config is valid
 *
 * @param {Object} context - Validation context
 * @returns {boolean}
 */
function validateGoldEDConfigStep(context) {
    const { event, fileSystem } = context;

    // Check if config file was saved
    if (event.type !== 'file.saved' || event.path !== 'C:\\FIDO\\GOLDED.CFG') {
        return false;
    }

    // Read saved config
    const configFile = fileSystem.cat('C:\\FIDO\\GOLDED.CFG');
    if (!configFile.ok) {
        return false;
    }

    // Parse config
    const config = parseGoldEDConfig(configFile.content);

    // Validate required fields
    return !!(config.username && config.address);
}

/**
 * Validate file exists
 * Checks if a specific file exists in the filesystem
 *
 * @param {Object} context - Validation context
 * @param {string} context.metadata.path - File path to check
 * @returns {boolean}
 */
function validateFileExists(context) {
    const { metadata, fileSystem } = context;
    const result = fileSystem.cat(metadata.path);
    return result.ok;
}

/**
 * Validate inventory contains item
 * Checks if player inventory has specific item
 *
 * @param {Object} context - Validation context
 * @param {string} context.metadata.item - Item ID to check
 * @returns {boolean}
 */
function validateInventoryHas(context) {
    const { metadata, state } = context;
    return state.player.inventory.includes(metadata.item);
}

/**
 * Parse T-Mail config from file content
 * @param {string} content - File content
 * @returns {Object} Parsed config
 */
function parseTMailConfig(content) {
    const config = {};
    const lines = content.split('\n');

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith(';')) {
            const parts = trimmed.split(/\s+/);
            if (parts.length >= 2) {
                const key = parts[0].toLowerCase();
                const value = parts.slice(1).join(' ');
                config[key] = value;
            }
        }
    });

    return {
        address: config.address || '',
        password: config.password || '',
        bossAddress: config.bossaddress || '',
        bossPhone: config.bossphone || '',
        inbound: config.inbound || '',
        outbound: config.outbound || '',
    };
}

/**
 * Parse GoldED config from file content
 * @param {string} content - File content
 * @returns {Object} Parsed config
 */
function parseGoldEDConfig(content) {
    const config = {};
    const lines = content.split('\n');

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith(';')) {
            const parts = trimmed.split(/\s+/);
            if (parts.length >= 2) {
                const key = parts[0].toLowerCase();
                const value = parts.slice(1).join(' ');
                config[key] = value;
            }
        }
    });

    return {
        username: config.username || '',
        realname: config.realname || '',
        address: config.address || '',
        origin: config.origin || '',
    };
}

/**
 * Get validator function by name
 * @param {string} name - Validator name
 * @returns {Function|null}
 */
export function getValidator(name) {
    return VALIDATORS[name] || null;
}

/**
 * Check if validator exists
 * @param {string} name - Validator name
 * @returns {boolean}
 */
export function hasValidator(name) {
    return name in VALIDATORS;
}
