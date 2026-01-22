// (C) 2021-2026 GoodData Corporation

import { type SagaIterator } from "redux-saga";
import { actionChannel, select, take } from "redux-saga/effects";

import { type DashboardEventHandler } from "../../eventHandlers/eventHandler.js";
import { isDashboardEventOrCustomDashboardEvent } from "../../events/base.js";
import { type DashboardEvents } from "../../events/index.js";
import { type DashboardDispatch, type DashboardSelectorEvaluator, type DashboardState } from "../types.js";

export interface IEventEmitter {
    registerHandler: (handler: DashboardEventHandler) => void;
    unregisterHandler: (handler: DashboardEventHandler) => void;
    eventEmitterSaga: () => SagaIterator<void>;
}

/**
 * Creates root event emitter that will be responsible for emitting events to all registered handlers.
 *
 * The emitter is realized using a saga. This saga has its own dedicated channel through which it receives
 * the events to emit - the event bus. Upon emitter start, it creates the channel and sets it into the
 * `eventEmitterContext` field of the saga context - this way other sagas can get hold of it.
 *
 * @param initialHandlers - event handlers to register at the time of creation
 * @param dispatch - dispatch object
 */
export function createRootEventEmitter(
    initialHandlers: DashboardEventHandler[] = [],
    dispatch: DashboardDispatch,
): IEventEmitter {
    let eventHandlers = [...initialHandlers];

    return {
        registerHandler: (handler) => {
            eventHandlers.push(handler);
        },
        unregisterHandler: (handler) => {
            eventHandlers = eventHandlers.filter((h) => h !== handler);
        },
        eventEmitterSaga: function* () {
            const eventChannel = yield actionChannel(isDashboardEventOrCustomDashboardEvent);

            while (true) {
                const event: DashboardEvents = yield take(eventChannel);

                // snapshot current state to ensure event handlers operate on state relevant to when they were fired
                const stateSnapshot: DashboardState = yield select();
                const selectorEvaluator: DashboardSelectorEvaluator = (selector) => selector(stateSnapshot);

                try {
                    eventHandlers.forEach((handler) => {
                        if (handler.eval(event)) {
                            handler.handler(event, dispatch, selectorEvaluator);
                        }
                    });
                } catch (e) {
                    console.error("Error has occurred while dispatching event", event, e);
                }
            }
        },
    };
}
