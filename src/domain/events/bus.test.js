import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from './bus';

describe('EventBus', () => {
    let bus;

    beforeEach(() => {
        bus = new EventBus();
    });

    describe('subscribe and publish', () => {
        it('calls subscriber when event is published', () => {
            const callback = vi.fn();
            bus.subscribe('test.event', callback);

            bus.publish('test.event', { data: 'test' });

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'test.event',
                    data: 'test',
                    timestamp: expect.any(Number),
                })
            );
        });

        it('supports multiple subscribers for same event', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            bus.subscribe('test.event', callback1);
            bus.subscribe('test.event', callback2);

            bus.publish('test.event', { value: 42 });

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
        });

        it('does not call subscriber for different event', () => {
            const callback = vi.fn();
            bus.subscribe('event.a', callback);

            bus.publish('event.b', {});

            expect(callback).not.toHaveBeenCalled();
        });

        it('includes timestamp in published events', () => {
            const callback = vi.fn();
            bus.subscribe('test.event', callback);

            const before = Date.now();
            bus.publish('test.event', {});
            const after = Date.now();

            const event = callback.mock.calls[0][0];
            expect(event.timestamp).toBeGreaterThanOrEqual(before);
            expect(event.timestamp).toBeLessThanOrEqual(after);
        });
    });

    describe('unsubscribe', () => {
        it('returns unsubscribe function', () => {
            const callback = vi.fn();
            const unsubscribe = bus.subscribe('test.event', callback);

            expect(typeof unsubscribe).toBe('function');
        });

        it('stops calling subscriber after unsubscribe', () => {
            const callback = vi.fn();
            const unsubscribe = bus.subscribe('test.event', callback);

            bus.publish('test.event', {});
            expect(callback).toHaveBeenCalledTimes(1);

            unsubscribe();
            bus.publish('test.event', {});
            expect(callback).toHaveBeenCalledTimes(1); // Still 1, not 2
        });

        it('does not affect other subscribers when one unsubscribes', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            const unsub1 = bus.subscribe('test.event', callback1);
            bus.subscribe('test.event', callback2);

            unsub1();
            bus.publish('test.event', {});

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalledTimes(1);
        });
    });

    describe('wildcard subscribers', () => {
        it('calls wildcard subscriber for all events', () => {
            const wildcard = vi.fn();
            bus.subscribe('*', wildcard);

            bus.publish('event.a', { a: 1 });
            bus.publish('event.b', { b: 2 });
            bus.publish('event.c', { c: 3 });

            expect(wildcard).toHaveBeenCalledTimes(3);
        });

        it('wildcard subscriber receives correct event types', () => {
            const wildcard = vi.fn();
            bus.subscribe('*', wildcard);

            bus.publish('event.test', { value: 123 });

            expect(wildcard).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'event.test',
                    value: 123,
                })
            );
        });
    });

    describe('subscribeMultiple', () => {
        it('subscribes to multiple events at once', () => {
            const callback = vi.fn();
            bus.subscribeMultiple(['event.a', 'event.b', 'event.c'], callback);

            bus.publish('event.a', {});
            bus.publish('event.b', {});
            bus.publish('event.c', {});

            expect(callback).toHaveBeenCalledTimes(3);
        });

        it('returns unsubscribe function that removes all subscriptions', () => {
            const callback = vi.fn();
            const unsubscribe = bus.subscribeMultiple(['event.a', 'event.b'], callback);

            bus.publish('event.a', {});
            expect(callback).toHaveBeenCalledTimes(1);

            unsubscribe();

            bus.publish('event.a', {});
            bus.publish('event.b', {});
            expect(callback).toHaveBeenCalledTimes(1); // Still 1
        });
    });

    describe('error handling', () => {
        it('catches errors in event handlers and continues', () => {
            const errorCallback = vi.fn(() => {
                throw new Error('Handler error');
            });
            const normalCallback = vi.fn();

            bus.subscribe('test.event', errorCallback);
            bus.subscribe('test.event', normalCallback);

            // Should not throw
            expect(() => {
                bus.publish('test.event', {});
            }).not.toThrow();

            expect(errorCallback).toHaveBeenCalled();
            expect(normalCallback).toHaveBeenCalled();
        });
    });

    describe('utility methods', () => {
        it('getSubscriberCount returns correct count', () => {
            expect(bus.getSubscriberCount('test.event')).toBe(0);

            bus.subscribe('test.event', () => {});
            expect(bus.getSubscriberCount('test.event')).toBe(1);

            bus.subscribe('test.event', () => {});
            expect(bus.getSubscriberCount('test.event')).toBe(2);
        });

        it('getEventTypes returns registered event types', () => {
            bus.subscribe('event.a', () => {});
            bus.subscribe('event.b', () => {});
            bus.subscribe('event.c', () => {});

            const types = bus.getEventTypes();
            expect(types).toContain('event.a');
            expect(types).toContain('event.b');
            expect(types).toContain('event.c');
            expect(types.length).toBe(3);
        });

        it('clear removes all subscribers', () => {
            bus.subscribe('event.a', () => {});
            bus.subscribe('event.b', () => {});

            expect(bus.getEventTypes().length).toBe(2);

            bus.clear();

            expect(bus.getEventTypes().length).toBe(0);
            expect(bus.getSubscriberCount('event.a')).toBe(0);
        });
    });
});
