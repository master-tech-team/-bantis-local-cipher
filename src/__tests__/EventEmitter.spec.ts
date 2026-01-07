import { EventEmitter } from '../core/EventEmitter';

describe('EventEmitter', () => {
    let emitter: EventEmitter;

    beforeEach(() => {
        emitter = new EventEmitter();
    });

    describe('Event Registration', () => {
        it('should register event listeners', () => {
            const handler = jest.fn();
            emitter.on('encrypted', handler);

            expect(emitter.listenerCount('encrypted')).toBe(1);
        });

        it('should register multiple listeners for same event', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            emitter.on('encrypted', handler1);
            emitter.on('encrypted', handler2);

            expect(emitter.listenerCount('encrypted')).toBe(2);
        });

        it('should register once listeners', () => {
            const handler = jest.fn();
            emitter.once('encrypted', handler);

            expect(emitter.listenerCount('encrypted')).toBe(1);
        });
    });

    describe('Event Emission', () => {
        it('should emit events to listeners', () => {
            const handler = jest.fn();
            emitter.on('encrypted', handler);

            emitter.emit('encrypted', { key: 'test' });

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'encrypted',
                    key: 'test'
                })
            );
        });

        it('should call all registered listeners', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            emitter.on('encrypted', handler1);
            emitter.on('encrypted', handler2);

            emitter.emit('encrypted', { key: 'test' });

            expect(handler1).toHaveBeenCalledTimes(1);
            expect(handler2).toHaveBeenCalledTimes(1);
        });

        it('should call once listeners only once', () => {
            const handler = jest.fn();
            emitter.once('encrypted', handler);

            emitter.emit('encrypted', { key: 'test1' });
            emitter.emit('encrypted', { key: 'test2' });

            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('should include timestamp in event data', () => {
            const handler = jest.fn();
            emitter.on('encrypted', handler);

            const beforeTime = Date.now();
            emitter.emit('encrypted', { key: 'test' });
            const afterTime = Date.now();

            const eventData = handler.mock.calls[0][0];
            expect(eventData.timestamp).toBeGreaterThanOrEqual(beforeTime);
            expect(eventData.timestamp).toBeLessThanOrEqual(afterTime);
        });
    });

    describe('Event Removal', () => {
        it('should remove specific listener', () => {
            const handler = jest.fn();
            emitter.on('encrypted', handler);
            emitter.off('encrypted', handler);

            expect(emitter.listenerCount('encrypted')).toBe(0);
        });

        it('should remove all listeners for event', () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            emitter.on('encrypted', handler1);
            emitter.on('encrypted', handler2);
            emitter.removeAllListeners('encrypted');

            expect(emitter.listenerCount('encrypted')).toBe(0);
        });

        it('should remove all listeners for all events', () => {
            emitter.on('encrypted', jest.fn());
            emitter.on('decrypted', jest.fn());
            emitter.removeAllListeners();

            expect(emitter.listenerCount('encrypted')).toBe(0);
            expect(emitter.listenerCount('decrypted')).toBe(0);
        });
    });

    describe('Event Names', () => {
        it('should return list of events with listeners', () => {
            emitter.on('encrypted', jest.fn());
            emitter.on('decrypted', jest.fn());

            const events = emitter.eventNames();
            expect(events).toContain('encrypted');
            expect(events).toContain('decrypted');
        });
    });

    describe('Error Handling', () => {
        it('should handle errors in listeners gracefully', () => {
            const errorHandler = jest.fn(() => {
                throw new Error('Handler error');
            });
            const normalHandler = jest.fn();

            emitter.on('encrypted', errorHandler);
            emitter.on('encrypted', normalHandler);

            // Should not throw
            expect(() => {
                emitter.emit('encrypted', { key: 'test' });
            }).not.toThrow();

            // Normal handler should still be called
            expect(normalHandler).toHaveBeenCalled();
        });
    });
});
