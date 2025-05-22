import { eventBus } from '../eventBus';
import { GameEventType } from '@/types/models';

describe('Event Bus', () => {
    beforeEach(() => {
        // Reset the event bus before each test
        eventBus.clearAllEvents();
        eventBus.clearEventHistory();
    });

    it('should register event listeners and call them on emit', () => {
        const mockCallback = jest.fn();

        eventBus.on('testEvent', mockCallback);

        const testData = { test: 'data' };
        eventBus.emit('testEvent', testData);

        expect(mockCallback).toHaveBeenCalledWith(testData);
    });

    it('should allow unsubscribing from events', () => {
        const mockCallback = jest.fn();

        const unsubscribe = eventBus.on('unsubscribeTest', mockCallback);
        unsubscribe();

        eventBus.emit('unsubscribeTest', 'test');

        expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should call multiple listeners for the same event', () => {
        const mockCallback1 = jest.fn();
        const mockCallback2 = jest.fn();

        eventBus.on('multipleEvent', mockCallback1);
        eventBus.on('multipleEvent', mockCallback2);

        eventBus.emit('multipleEvent', 'test');

        expect(mockCallback1).toHaveBeenCalledWith('test');
        expect(mockCallback2).toHaveBeenCalledWith('test');
    });

    it('should handle events with multiple arguments', () => {
        const mockCallback = jest.fn();

        eventBus.on('multiArgEvent', mockCallback);

        const payload = {
            arg1: 'arg1',
            num: 123,
            obj: { key: 'value' }
        };
        eventBus.emit('multiArgEvent', payload);

        expect(mockCallback).toHaveBeenCalledWith(payload);
    });

    it('should allow subscribing to an event once', () => {
        const mockCallback = jest.fn();

        eventBus.once('onceEvent', mockCallback);

        eventBus.emit('onceEvent', 'data1');
        eventBus.emit('onceEvent', 'data2');

        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith('data1');
    });

    it('should check if an event has listeners', () => {
        const mockCallback = jest.fn();

        expect(eventBus.hasListeners('checkEvent')).toBe(false);

        eventBus.on('checkEvent', mockCallback);

        expect(eventBus.hasListeners('checkEvent')).toBe(true);
    });

    it('should count listeners for an event', () => {
        expect(eventBus.listenerCount('countEvent')).toBe(0);

        const callback1 = jest.fn();
        const callback2 = jest.fn();
        const callback3 = jest.fn();

        eventBus.on('countEvent', callback1);
        expect(eventBus.listenerCount('countEvent')).toBe(1);

        eventBus.on('countEvent', callback2);
        eventBus.on('countEvent', callback3);
        expect(eventBus.listenerCount('countEvent')).toBe(3);

        const unsubscribe = eventBus.on('countEvent', jest.fn());
        expect(eventBus.listenerCount('countEvent')).toBe(4);

        unsubscribe();
        expect(eventBus.listenerCount('countEvent')).toBe(3);
    });

    it('should clear listeners for a specific event', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        eventBus.on('clearEvent', callback1);
        eventBus.on('otherEvent', callback2);

        eventBus.clearEvent('clearEvent');

        eventBus.emit('clearEvent', 'test');
        eventBus.emit('otherEvent', 'test');

        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });

    it('should clear all event listeners', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        eventBus.on('event1', callback1);
        eventBus.on('event2', callback2);

        eventBus.clearAllEvents();

        eventBus.emit('event1', 'test');
        eventBus.emit('event2', 'test');

        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).not.toHaveBeenCalled();
    });

    it('should log events and provide event history', () => {
        eventBus.emit('historyTest1', { value: 1 });
        eventBus.emit('historyTest2', { value: 2 });
        eventBus.emit('historyTest1', { value: 3 });

        const history = eventBus.getEventHistory();

        expect(history.length).toBe(3);
        expect(history[0].event).toBe('historyTest1');
        expect(history[0].data).toEqual({ value: 1 });
        expect(history[1].event).toBe('historyTest2');
        expect(history[2].event).toBe('historyTest1');
        expect(history[2].data).toEqual({ value: 3 });
    });

    it('should filter event history by event type', () => {
        eventBus.emit('filterTest1', { value: 1 });
        eventBus.emit('filterTest2', { value: 2 });
        eventBus.emit('filterTest1', { value: 3 });

        const filteredHistory = eventBus.getEventHistory(undefined, 'filterTest1');

        expect(filteredHistory.length).toBe(2);
        expect(filteredHistory[0].event).toBe('filterTest1');
        expect(filteredHistory[1].event).toBe('filterTest1');
    });

    it('should limit event history when requested', () => {
        eventBus.emit('limitTest1', { value: 1 });
        eventBus.emit('limitTest2', { value: 2 });
        eventBus.emit('limitTest3', { value: 3 });

        const limitedHistory = eventBus.getEventHistory(2);

        expect(limitedHistory.length).toBe(2);
        expect(limitedHistory[0].event).toBe('limitTest2');
        expect(limitedHistory[1].event).toBe('limitTest3');
    });

    it('should handle errors in event listeners without breaking other listeners', () => {
        const errorCallback = jest.fn().mockImplementation(() => {
            throw new Error('Test error');
        });

        const validCallback = jest.fn();

        // Spy on console.error to suppress error message in test output
        jest.spyOn(console, 'error').mockImplementation(() => { });

        eventBus.on('errorEvent', errorCallback);
        eventBus.on('errorEvent', validCallback);

        // This should not throw, despite the error in the first callback
        eventBus.emit('errorEvent', 'test');

        expect(errorCallback).toHaveBeenCalled();
        expect(validCallback).toHaveBeenCalled();

        // Restore console.error
        (console.error as jest.Mock).mockRestore();
    });

    it('should remove events when all listeners are unsubscribed', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        const unsubscribe1 = eventBus.on('cleanupEvent', callback1);
        const unsubscribe2 = eventBus.on('cleanupEvent', callback2);

        expect(eventBus.hasListeners('cleanupEvent')).toBe(true);

        unsubscribe1();
        expect(eventBus.hasListeners('cleanupEvent')).toBe(true);

        unsubscribe2();
        expect(eventBus.hasListeners('cleanupEvent')).toBe(false);
    });

    it('should work with predefined game event types', () => {
        const mockCallback = jest.fn();

        // Use a predefined event type from GameEventType
        const gameEvent: GameEventType = 'game_started';

        eventBus.on(gameEvent, mockCallback);
        eventBus.emit(gameEvent, { level: 1 });

        expect(mockCallback).toHaveBeenCalledWith({ level: 1 });
    });
}); 