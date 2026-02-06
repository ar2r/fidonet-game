import { describe, it, expect } from 'vitest';
import {
    getTimeCost, minutesToTimeString, timeStringToMinutes,
    getPhaseForTime, isZMH, computeTickEffects
} from './gameTick';

describe('gameTick', () => {
    describe('getTimeCost', () => {
        it('returns 0 for CLS', () => {
            expect(getTimeCost('CLS')).toBe(0);
        });

        it('returns 2 for ATZ', () => {
            expect(getTimeCost('ATZ')).toBe(2);
        });

        it('returns 5 for DIAL', () => {
            expect(getTimeCost('DIAL 555-3389')).toBe(5);
        });

        it('returns 1 for DIR', () => {
            expect(getTimeCost('DIR')).toBe(1);
        });

        it('returns 15 for download (1)', () => {
            expect(getTimeCost('1')).toBe(15);
        });

        it('returns 1 for unknown commands', () => {
            expect(getTimeCost('FOOBAR')).toBe(1);
        });
    });

    describe('minutesToTimeString', () => {
        it('converts 0 to 00:00', () => {
            expect(minutesToTimeString(0)).toBe('00:00');
        });

        it('converts 1380 to 23:00', () => {
            expect(minutesToTimeString(1380)).toBe('23:00');
        });

        it('wraps past midnight', () => {
            expect(minutesToTimeString(1440)).toBe('00:00');
            expect(minutesToTimeString(1500)).toBe('01:00');
        });
    });

    describe('timeStringToMinutes', () => {
        it('converts 23:00 to 1380', () => {
            expect(timeStringToMinutes('23:00')).toBe(1380);
        });

        it('converts 00:00 to 0', () => {
            expect(timeStringToMinutes('00:00')).toBe(0);
        });
    });

    describe('getPhaseForTime', () => {
        it('returns night for 23:00', () => {
            expect(getPhaseForTime(1380)).toBe('night');
        });

        it('returns day for 12:00', () => {
            expect(getPhaseForTime(720)).toBe('day');
        });

        it('returns night for 04:00', () => {
            expect(getPhaseForTime(240)).toBe('night');
        });

        it('returns day for 06:00', () => {
            expect(getPhaseForTime(360)).toBe('day');
        });

        it('returns night for 22:00', () => {
            expect(getPhaseForTime(1320)).toBe('night');
        });
    });

    describe('isZMH', () => {
        it('returns true at 04:00', () => {
            expect(isZMH(240)).toBe(true);
        });

        it('returns true at 04:30', () => {
            expect(isZMH(270)).toBe(true);
        });

        it('returns false at 05:00', () => {
            expect(isZMH(300)).toBe(false);
        });

        it('returns false at 12:00', () => {
            expect(isZMH(720)).toBe(false);
        });
    });

    describe('computeTickEffects', () => {
        it('advances time correctly', () => {
            const effects = computeTickEffects(1380, 5, false);
            expect(effects.newTimeString).toBe('23:05');
            expect(effects.newMinutes).toBe(1385);
        });

        it('detects day change', () => {
            const effects = computeTickEffects(1435, 10, false);
            expect(effects.daysAdvanced).toBe(1);
            expect(effects.newTimeString).toBe('00:05');
        });

        it('decreases mom patience when connected at night', () => {
            const effects = computeTickEffects(1380, 5, true);
            expect(effects.momPatienceDelta).toBe(-1);
        });

        it('does not decrease mom patience during day', () => {
            const effects = computeTickEffects(720, 5, true);
            expect(effects.momPatienceDelta).toBe(0);
        });

        it('does not decrease mom patience when not connected', () => {
            const effects = computeTickEffects(1380, 5, false);
            expect(effects.momPatienceDelta).toBe(0);
        });
    });
});
