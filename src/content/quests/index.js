/**
 * Quest Content - Centralized export
 * All quests organized by Act
 */

import { ACT1_QUESTS } from './act1';
import { ACT2_QUESTS } from './act2';
import { ACT3_QUESTS } from './act3';
import { validateQuestCollection } from '../../domain/quests/schema';

/**
 * All quests in the game
 */
export const ALL_QUESTS = [
    ...ACT1_QUESTS,
    ...ACT2_QUESTS,
    ...ACT3_QUESTS,
    // ...ACT4_QUESTS,  // TODO: Phase 12
];

/**
 * Quest map for fast lookup by ID
 */
export const QUEST_MAP = new Map(
    ALL_QUESTS.map(quest => [quest.id, quest])
);

/**
 * Get quest by ID
 * @param {string} id - Quest ID
 * @returns {Object|null}
 */
export function getQuestById(id) {
    return QUEST_MAP.get(id) || null;
}

/**
 * Get quest title by ID
 * @param {string} id - Quest ID
 * @returns {string}
 */
export function getQuestTitle(id) {
    const quest = getQuestById(id);
    return quest ? quest.title : 'Нет активного квеста';
}

/**
 * Get quests by Act
 * @param {number} act - Act number
 * @returns {Object[]}
 */
export function getQuestsByAct(act) {
    return ALL_QUESTS.filter(q => q.act === act);
}

/**
 * Get first quest in Act
 * @param {number} act - Act number
 * @returns {Object|null}
 */
export function getFirstQuestInAct(act) {
    const quests = getQuestsByAct(act);
    return quests.find(q => !q.prerequisites || q.prerequisites.length === 0) || null;
}

/**
 * Validate all quests on module load
 * Throws error if validation fails (fail-fast in development)
 */
const validation = validateQuestCollection(ALL_QUESTS);
if (!validation.valid) {
    console.error('Quest validation errors:', validation.errors);
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV === 'development') {
        throw new Error(`Quest validation failed:\n${validation.errors.join('\n')}`);
    }
}

// Export for backwards compatibility with old code
export const QUESTS = {
    INIT_MODEM: getQuestById('init_modem'),
    FIRST_CONNECT: getQuestById('first_connect'),
    DOWNLOAD_SOFTWARE: getQuestById('download_software'),
    CONFIGURE_TMAIL: getQuestById('configure_tmail'),
    CONFIGURE_GOLDED: getQuestById('configure_golded'),
    POLL_BOSS: getQuestById('poll_boss'),
    READ_RULES: getQuestById('read_rules'),
    REPLY_WELCOME: getQuestById('reply_welcome'),
};

export const QUEST_LIST = ALL_QUESTS;