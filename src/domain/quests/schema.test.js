import { describe, it, expect } from 'vitest';
import { validateQuestSchema, validateQuestCollection, StepType, RewardType } from './schema';

describe('Quest Schema Validation', () => {
    describe('validateQuestSchema', () => {
        const validQuest = {
            id: 'test_quest',
            act: 1,
            title: 'Test Quest',
            description: 'A test quest',
            steps: [
                {
                    id: 'step1',
                    type: StepType.EVENT,
                    event: 'test.event',
                },
            ],
            rewards: [
                {
                    type: RewardType.SKILL,
                    key: 'typing',
                    delta: 1,
                },
            ],
        };

        it('validates a correct quest', () => {
            const result = validateQuestSchema(validQuest);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('requires id field', () => {
            const quest = { ...validQuest, id: undefined };
            const result = validateQuestSchema(quest);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('id'))).toBe(true);
        });

        it('requires act field', () => {
            const quest = { ...validQuest, act: undefined };
            const result = validateQuestSchema(quest);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('act'))).toBe(true);
        });

        it('requires title field', () => {
            const quest = { ...validQuest, title: undefined };
            const result = validateQuestSchema(quest);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('title'))).toBe(true);
        });

        it('requires description field', () => {
            const quest = { ...validQuest, description: undefined };
            const result = validateQuestSchema(quest);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('description'))).toBe(true);
        });

        it('validates prerequisites are strings', () => {
            const quest = { ...validQuest, prerequisites: ['valid', 123] };
            const result = validateQuestSchema(quest);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('prerequisites'))).toBe(true);
        });

        it('validates step has id', () => {
            const quest = {
                ...validQuest,
                steps: [{ type: StepType.EVENT, event: 'test' }],
            };
            const result = validateQuestSchema(quest);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('Step') && e.includes('id'))).toBe(true);
        });

        it('validates step has valid type', () => {
            const quest = {
                ...validQuest,
                steps: [{ id: 'step1', type: 'invalid_type' }],
            };
            const result = validateQuestSchema(quest);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('valid type'))).toBe(true);
        });

        it('validates event step has event field', () => {
            const quest = {
                ...validQuest,
                steps: [{ id: 'step1', type: StepType.EVENT }],
            };
            const result = validateQuestSchema(quest);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('event type'))).toBe(true);
        });

        it('validates reward has valid type', () => {
            const quest = {
                ...validQuest,
                rewards: [{ type: 'invalid_type', delta: 1 }],
            };
            const result = validateQuestSchema(quest);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('Reward') && e.includes('valid type'))).toBe(true);
        });

        it('validates skill reward has key', () => {
            const quest = {
                ...validQuest,
                rewards: [{ type: RewardType.SKILL, delta: 1 }],
            };
            const result = validateQuestSchema(quest);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('key'))).toBe(true);
        });

        it('validates item reward has item ID', () => {
            const quest = {
                ...validQuest,
                rewards: [{ type: RewardType.ITEM }],
            };
            const result = validateQuestSchema(quest);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('item ID'))).toBe(true);
        });
    });

    describe('validateQuestCollection', () => {
        it('validates a valid collection', () => {
            const quests = [
                {
                    id: 'quest1',
                    act: 1,
                    title: 'Quest 1',
                    description: 'First quest',
                    nextQuest: 'quest2',
                    rewards: [],
                    steps: [],
                    prerequisites: [],
                },
                {
                    id: 'quest2',
                    act: 1,
                    title: 'Quest 2',
                    description: 'Second quest',
                    prerequisites: ['quest1'],
                    rewards: [],
                    steps: [],
                },
            ];

            const result = validateQuestCollection(quests);
            if (!result.valid) {
                console.log('Validation errors:', result.errors);
            }
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('detects duplicate quest IDs', () => {
            const quests = [
                { id: 'quest1', act: 1, title: 'Q1', description: 'D1' },
                { id: 'quest1', act: 1, title: 'Q2', description: 'D2' },
            ];

            const result = validateQuestCollection(quests);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true);
        });

        it('detects invalid prerequisite references', () => {
            const quests = [
                {
                    id: 'quest1',
                    act: 1,
                    title: 'Q1',
                    description: 'D1',
                    prerequisites: ['nonexistent'],
                },
            ];

            const result = validateQuestCollection(quests);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('prerequisite'))).toBe(true);
        });

        it('detects invalid nextQuest references', () => {
            const quests = [
                {
                    id: 'quest1',
                    act: 1,
                    title: 'Q1',
                    description: 'D1',
                    nextQuest: 'nonexistent',
                },
            ];

            const result = validateQuestCollection(quests);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('nextQuest'))).toBe(true);
        });

        it('detects circular dependencies', () => {
            const quests = [
                {
                    id: 'quest1',
                    act: 1,
                    title: 'Q1',
                    description: 'D1',
                    nextQuest: 'quest2',
                },
                {
                    id: 'quest2',
                    act: 1,
                    title: 'Q2',
                    description: 'D2',
                    nextQuest: 'quest1',
                },
            ];

            const result = validateQuestCollection(quests);
            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('Circular'))).toBe(true);
        });
    });
});
