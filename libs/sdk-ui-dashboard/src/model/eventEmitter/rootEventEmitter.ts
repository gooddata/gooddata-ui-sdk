// (C) 2021 GoodData Corporation
import { actionChannel, take } from "redux-saga/effects";
import { DashboardEventHandler } from "../events/eventHandler";
import { DashboardEvents } from "../events";

export type EventEmitter = {
    registerHandler: (handler: DashboardEventHandler) => void;
    // TODO: type this
    eventEmitterSaga: any;
};

/**
 * Creates root event emitter that will be responsible for emitting events to all registered handlers.
 *
 * The emitter is realized using a saga. This saga has its own dedicated channel through which it receives
 * the events to emit - the event bus. Upon emitter start, it creates the channel and sets it into the
 * `eventEmitterContext` field of the saga context - this way other sagas can get hold of it.
 *
 * @param initialHandlers - event handlers to register at the time of creation
 */
export function createRootEventEmitter(initialHandlers: DashboardEventHandler[] = []): EventEmitter {
    const eventHandlers = initialHandlers;

    return {
        registerHandler: (handler: DashboardEventHandler) => {
            eventHandlers.push(handler);
        },
        eventEmitterSaga: function* () {
            // eslint-disable-next-line no-console
            console.debug("starting root event emitter");

            const eventChannel = yield actionChannel((action: any) =>
                action.type.startsWith("GDC.DASHBOARD.EVT"),
            );

            while (true) {
                const event: DashboardEvents = yield take(eventChannel);

                eventHandlers.forEach((handler) => {
                    if (handler.eval(event.type)) {
                        handler.handler(event);
                    }
                });
            }
        },
    };
}
