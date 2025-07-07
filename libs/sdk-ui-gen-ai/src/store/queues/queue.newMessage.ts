// (C) 2025 GoodData Corporation

import { Middleware, PayloadAction } from "@reduxjs/toolkit";

import { newMessageAction } from "../messages/messagesSlice.js";

export const queueMiddleware: Middleware = (storeAPI) => {
    const actionQueue: PayloadAction<unknown>[] = [];

    let draining = false;
    const drainQueue = () => {
        if (draining) {
            return;
        }

        draining = true;

        const interval = setInterval(() => {
            const state = storeAPI.getState();
            const asyncProcess = state.messages.asyncProcess;

            // If asyncProcess is not active, and there are actions in the queue, dispatch the next one
            if (!asyncProcess && actionQueue.length > 0) {
                const nextAction = actionQueue.shift() as PayloadAction<unknown>;
                storeAPI.dispatch(nextAction);
            }
            // If asyncProcess is not active, and the queue is empty, stop the interval
            if (!asyncProcess && actionQueue.length === 0) {
                clearInterval(interval);
                draining = false;
            }
        }, 50);
    };

    return (next) => (a: unknown) => {
        const state = storeAPI.getState();
        const action = a as PayloadAction<unknown>;

        // If it's newMessageAction and asyncProcess is active, queue it
        if (action?.type === newMessageAction.type && state.messages.asyncProcess) {
            actionQueue.push(action);
            drainQueue();
            return undefined;
        }
        // If it's newMessageAction and asyncProcess is not active, dispatch it normally
        return next(action);
    };
};
