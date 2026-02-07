/**
 * Quest Schema Definition
 * Declarative structure for quests with steps and validation
 */

/**
 * Quest Step Types
 */
export const StepType = {
    EVENT: 'event',           // Wait for domain event
    COMMAND: 'command',       // Execute specific command
    CONDITION: 'condition',   // Check game state condition
    MANUAL: 'manual',         // Manually triggered (legacy)
};

/**
 * Reward Types
 */
export const RewardType = {
    SKILL: 'skill',
    ITEM: 'item',
    STAT: 'stat',
    MONEY: 'money',
};

/**
 * Quest Schema
 * @typedef {Object} QuestStep
 * @property {string} id - Unique step identifier
 * @property {string} type - Step type (event, command, condition, manual)
 * @property {string} [event] - Domain event type (for type='event')
 * @property {string} [command] - Command to execute (for type='command')
 * @property {Function} [condition] - State checker (for type='condition')
 * @property {string} [description] - Human-readable description
 * @property {Object} [metadata] - Additional step data (path, validator, etc.)
 *
 * @typedef {Object} QuestReward
 * @property {string} type - Reward type (skill, item, stat, money)
 * @property {string} [key] - Reward key (skill name, item id, stat name)
 * @property {number} [delta] - Numeric change (for skills, stats, money)
 * @property {string} [item] - Item ID (for type='item')
 *
 * @typedef {Object} Quest
 * @property {string} id - Unique quest identifier
 * @property {number} act - Act number (1, 2, 3, 4)
 * @property {string} title - Quest display title
 * @property {string} description - Quest objective
 * @property {string} [hint] - Hint text for player
 * @property {string[]} [prerequisites] - Quest IDs that must be completed first
 * @property {QuestStep[]} [steps] - Quest steps (if multi-step)
 * @property {QuestReward[]} [rewards] - Rewards for completion
 * @property {string} [nextQuest] - Next quest ID in chain
 * @property {number} [completesAct] - Act number this quest completes (if any)
 */

/**
 * Validate quest structure
 * @param {Quest} quest - Quest to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateQuestSchema(quest) {
    const errors = [];

    // Required fields
    if (!quest.id || typeof quest.id !== 'string') {
        errors.push('Quest must have a valid id (string)');
    }

    if (!quest.act || typeof quest.act !== 'number') {
        errors.push('Quest must have a valid act (number)');
    }

    if (!quest.title || typeof quest.title !== 'string') {
        errors.push('Quest must have a valid title (string)');
    }

    if (!quest.description || typeof quest.description !== 'string') {
        errors.push('Quest must have a valid description (string)');
    }

    // Prerequisites validation
    if (quest.prerequisites) {
        if (!Array.isArray(quest.prerequisites)) {
            errors.push('prerequisites must be an array');
        } else if (!quest.prerequisites.every(p => typeof p === 'string')) {
            errors.push('All prerequisites must be strings (quest IDs)');
        }
    }

    // Steps validation
    if (quest.steps) {
        if (!Array.isArray(quest.steps)) {
            errors.push('steps must be an array');
        } else {
            quest.steps.forEach((step, index) => {
                if (!step.id) {
                    errors.push(`Step ${index} must have an id`);
                }
                if (!step.type || !Object.values(StepType).includes(step.type)) {
                    errors.push(`Step ${index} must have a valid type (${Object.values(StepType).join(', ')})`);
                }
                if (step.type === StepType.EVENT && !step.event) {
                    errors.push(`Step ${index} (type=event) must specify event type`);
                }
                if (step.type === StepType.COMMAND && !step.command) {
                    errors.push(`Step ${index} (type=command) must specify command`);
                }
                if (step.type === StepType.CONDITION && typeof step.condition !== 'function') {
                    errors.push(`Step ${index} (type=condition) must have a condition function`);
                }
            });
        }
    }

    // Rewards validation
    if (quest.rewards) {
        if (!Array.isArray(quest.rewards)) {
            errors.push('rewards must be an array');
        } else {
            quest.rewards.forEach((reward, index) => {
                if (!reward.type || !Object.values(RewardType).includes(reward.type)) {
                    errors.push(`Reward ${index} must have a valid type (${Object.values(RewardType).join(', ')})`);
                }
                if ((reward.type === RewardType.SKILL || reward.type === RewardType.STAT) && !reward.key) {
                    errors.push(`Reward ${index} (type=${reward.type}) must have a key`);
                }
                if (reward.type === RewardType.ITEM && !reward.item) {
                    errors.push(`Reward ${index} (type=item) must have an item ID`);
                }
            });
        }
    }

    // NextQuest validation
    if (quest.nextQuest && typeof quest.nextQuest !== 'string') {
        errors.push('nextQuest must be a string (quest ID) or null');
    }

    // CompletesAct validation
    if (quest.completesAct !== undefined && typeof quest.completesAct !== 'number') {
        errors.push('completesAct must be a number (act number)');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Validate a collection of quests
 * Checks for:
 * - Unique IDs
 * - Valid prerequisite references
 * - Valid nextQuest references
 * - No circular dependencies
 *
 * @param {Quest[]} quests - Array of quests to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateQuestCollection(quests) {
    const errors = [];
    const questIds = new Set();
    const questMap = new Map();

    // Build map and check uniqueness
    quests.forEach(quest => {
        if (questIds.has(quest.id)) {
            errors.push(`Duplicate quest ID: ${quest.id}`);
        } else {
            questIds.add(quest.id);
            questMap.set(quest.id, quest);
        }

        // Validate individual quest schema
        const schemaValidation = validateQuestSchema(quest);
        if (!schemaValidation.valid) {
            errors.push(`Quest ${quest.id}: ${schemaValidation.errors.join(', ')}`);
        }
    });

    // Check references
    quests.forEach(quest => {
        // Check prerequisites exist
        if (quest.prerequisites) {
            quest.prerequisites.forEach(prereqId => {
                if (!questIds.has(prereqId)) {
                    errors.push(`Quest ${quest.id}: prerequisite ${prereqId} does not exist`);
                }
            });
        }

        // Check nextQuest exists
        if (quest.nextQuest && !questIds.has(quest.nextQuest)) {
            errors.push(`Quest ${quest.id}: nextQuest ${quest.nextQuest} does not exist`);
        }
    });

    // Check for circular dependencies in nextQuest chain
    const visited = new Set();
    const checkNextQuestCycle = (questId, path = []) => {
        if (path.includes(questId)) {
            errors.push(`Circular nextQuest chain detected: ${path.join(' -> ')} -> ${questId}`);
            return;
        }

        if (visited.has(questId)) {
            return;
        }

        visited.add(questId);
        const quest = questMap.get(questId);

        if (quest?.nextQuest) {
            checkNextQuestCycle(quest.nextQuest, [...path, questId]);
        }
    };

    quests.forEach(quest => checkNextQuestCycle(quest.id));

    return {
        valid: errors.length === 0,
        errors,
    };
}
