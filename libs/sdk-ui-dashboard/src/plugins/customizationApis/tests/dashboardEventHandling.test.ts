// (C) 2021 GoodData Corporation

import { DefaultDashboardEventHandling } from "../dashboardEventHandling";
import { DashboardEventHandler, singleEventTypeHandler } from "../../../model";

function assertCorrectHandler(handler: DashboardEventHandler, expectedEvtType: string, handlerFn: any): void {
    // handler function should be kept as is
    expect(handler.handler).toEqual(handlerFn);
    // any errors here mean the facade does not create eval functions correctly
    expect(handler.eval({ type: expectedEvtType } as any)).toBeTruthy();
}

describe("dashboard event handling", () => {
    describe("during registration", () => {
        let Facade: DefaultDashboardEventHandling;
        beforeEach(() => {
            Facade = new DefaultDashboardEventHandling();
        });

        it("should add event handler", () => {
            const handler = jest.fn();

            Facade.addEventHandler("GDC.DASH/EVT.INITIALIZED", handler);
            const { eventHandlers } = Facade.getDashboardEventing();

            assertCorrectHandler(eventHandlers[0], "GDC.DASH/EVT.INITIALIZED", handler);
        });

        it("should remove event handler", () => {
            const handler = jest.fn();

            Facade.addEventHandler("GDC.DASH/EVT.INITIALIZED", handler);
            Facade.removeEventHandler("GDC.DASH/EVT.INITIALIZED", handler);
            const { eventHandlers } = Facade.getDashboardEventing();

            expect(eventHandlers).toEqual([]);
        });

        it("should not do anything if trying to remove non-existing handler", () => {
            const handler = jest.fn();

            Facade.removeEventHandler("GDC.DASH/EVT.INITIALIZED", handler);
            const { eventHandlers } = Facade.getDashboardEventing();

            expect(eventHandlers).toEqual([]);
        });

        it("should add two event handlers for same event", () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            Facade.addEventHandler("GDC.DASH/EVT.INITIALIZED", handler1);
            Facade.addEventHandler("GDC.DASH/EVT.INITIALIZED", handler2);
            const { eventHandlers } = Facade.getDashboardEventing();

            expect(eventHandlers.length).toEqual(2);

            assertCorrectHandler(eventHandlers[0], "GDC.DASH/EVT.INITIALIZED", handler1);
            assertCorrectHandler(eventHandlers[1], "GDC.DASH/EVT.INITIALIZED", handler2);
        });

        it("should not double-add same handler", () => {
            const handler = jest.fn();

            Facade.addEventHandler("GDC.DASH/EVT.INITIALIZED", handler);
            Facade.addEventHandler("GDC.DASH/EVT.INITIALIZED", handler);
            const { eventHandlers } = Facade.getDashboardEventing();

            expect(eventHandlers.length).toEqual(1);
        });

        it("should add custom event handler", () => {
            const handler = jest.fn();
            const eventHandler = singleEventTypeHandler("GDC.DASH/EVT.INITIALIZED", handler);

            Facade.addCustomEventHandler(eventHandler);
            const { eventHandlers } = Facade.getDashboardEventing();

            expect(eventHandlers.length).toEqual(1);
            expect(eventHandlers[0].handler).toBe(handler);
        });

        it("should remove custom event handler", () => {
            const handler = jest.fn();
            const eventHandler = singleEventTypeHandler("GDC.DASH/EVT.INITIALIZED", handler);

            Facade.addCustomEventHandler(eventHandler);
            Facade.removeCustomEventHandler(eventHandler);
            const { eventHandlers } = Facade.getDashboardEventing();

            expect(eventHandlers).toEqual([]);
        });

        it("should not do anything if trying to remove non-existing custom event handler", () => {
            const handler = jest.fn();
            const eventHandler = singleEventTypeHandler("GDC.DASH/EVT.INITIALIZED", handler);

            Facade.removeCustomEventHandler(eventHandler);
            const { eventHandlers } = Facade.getDashboardEventing();

            expect(eventHandlers).toEqual([]);
        });

        it("should not double-add same custom event handler", () => {
            const handler = jest.fn();
            const eventHandler = singleEventTypeHandler("GDC.DASH/EVT.INITIALIZED", handler);

            Facade.addCustomEventHandler(eventHandler);
            Facade.addCustomEventHandler(eventHandler);
            const { eventHandlers } = Facade.getDashboardEventing();

            expect(eventHandlers.length).toEqual(1);
        });

        it("should allow subscriptions to state changes", () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            Facade.subscribeToStateChanges(callback1);
            Facade.subscribeToStateChanges(callback2);

            const { onStateChange } = Facade.getDashboardEventing();
            onStateChange({} as any, {} as any);

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
        });
    });

    /*
     * The tests here verify that the appropriate event handler registration / unregistration logic is called
     * appropriately in different scenarios. The tests do not verify the call arguments as that is done
     * by the tests above (and in a simpler fashion); handler creation logic is the same.
     */
    describe("after registration", () => {
        let registerFn: jest.Mock;
        let unregisterFn: jest.Mock;
        let Facade: DefaultDashboardEventHandling;

        beforeEach(() => {
            registerFn = jest.fn();
            unregisterFn = jest.fn();
            Facade = new DefaultDashboardEventHandling();

            // this emulates what happens during plugin initialization. engine gets a hold of dashboard eventing
            // setup; it will have the onEventingInitialized callback set up. The callback will travel to
            // store which will dispatch register & unregister functions after the root event emitter is
            // up and running
            const { onEventingInitialized } = Facade.getDashboardEventing();
            onEventingInitialized(registerFn, unregisterFn);
        });

        it("should add event handler", () => {
            const handler = jest.fn();

            Facade.addEventHandler("GDC.DASH/EVT.INITIALIZED", handler);
            expect(registerFn).toHaveBeenCalledTimes(1);
        });

        it("should remove event handler", () => {
            const handler = jest.fn();

            Facade.addEventHandler("GDC.DASH/EVT.INITIALIZED", handler);
            Facade.removeEventHandler("GDC.DASH/EVT.INITIALIZED", handler);

            expect(registerFn).toHaveBeenCalledTimes(1);
            expect(unregisterFn).toHaveBeenCalledTimes(1);
        });

        it("should not do anything if trying to remove non-existing handler", () => {
            const handler = jest.fn();

            Facade.removeEventHandler("GDC.DASH/EVT.INITIALIZED", handler);
            expect(unregisterFn).not.toHaveBeenCalled();
        });

        it("should add two event handlers for same event", () => {
            const handler1 = jest.fn();
            const handler2 = jest.fn();

            Facade.addEventHandler("GDC.DASH/EVT.INITIALIZED", handler1);
            Facade.addEventHandler("GDC.DASH/EVT.INITIALIZED", handler2);

            expect(registerFn).toHaveBeenCalledTimes(2);
        });

        it("should not double-add same handler", () => {
            const handler = jest.fn();

            Facade.addEventHandler("GDC.DASH/EVT.INITIALIZED", handler);
            Facade.addEventHandler("GDC.DASH/EVT.INITIALIZED", handler);

            expect(registerFn).toHaveBeenCalledTimes(1);
        });

        it("should add custom event handler", () => {
            const handler = jest.fn();
            const eventHandler = singleEventTypeHandler("GDC.DASH/EVT.INITIALIZED", handler);

            Facade.addCustomEventHandler(eventHandler);

            expect(registerFn).toHaveBeenCalledTimes(1);
        });

        it("should remove custom event handler", () => {
            const handler = jest.fn();
            const eventHandler = singleEventTypeHandler("GDC.DASH/EVT.INITIALIZED", handler);

            Facade.addCustomEventHandler(eventHandler);
            Facade.removeCustomEventHandler(eventHandler);

            expect(registerFn).toHaveBeenCalledTimes(1);
            expect(unregisterFn).toHaveBeenCalledTimes(1);
        });

        it("should not do anything if trying to remove non-existing custom event handler", () => {
            const handler = jest.fn();
            const eventHandler = singleEventTypeHandler("GDC.DASH/EVT.INITIALIZED", handler);

            Facade.removeCustomEventHandler(eventHandler);
            expect(unregisterFn).not.toHaveBeenCalled();
        });

        it("should not double-add same custom event handler", () => {
            const handler = jest.fn();
            const eventHandler = singleEventTypeHandler("GDC.DASH/EVT.INITIALIZED", handler);

            Facade.addCustomEventHandler(eventHandler);
            Facade.addCustomEventHandler(eventHandler);

            expect(registerFn).toHaveBeenCalledTimes(1);
        });
    });
});
