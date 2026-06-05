// (C) 2025-2026 GoodData Corporation

import { type Middleware, type PayloadAction } from "@reduxjs/toolkit";

import { loadThreadAction, newMessageAction } from "../messages/messagesSlice.js";
import { type RootState } from "../types.js";
import { checkConversationData } from "../utils.js";

export const queueMiddleware: Middleware = (storeAPI) => {
    const actionQueue: PayloadAction<unknown>[] = [];

    let draining = false;
    const drainQueue = () => {
        if (draining) {
            return;
        }

        draining = true;

        const interval = setInterval(() => {
            const state = storeAPI.getState() as RootState;
            const asyncProcess = loadAsyncProcess(state);

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
        const state = storeAPI.getState() as RootState;
        const action = a as PayloadAction<unknown>;

        // Load async process from right place
        const asyncProcess = loadAsyncProcess(state);

        // Ignore loadThreadAction if the thread is being cleared
        if (action?.type === loadThreadAction.type && asyncProcess === "clearing") {
            return undefined;
        }
        // If it's newMessageAction and asyncProcess is active, queue it
        if (action?.type === newMessageAction.type && asyncProcess) {
            actionQueue.push(action);
            drainQueue();
            return undefined;
        }
        // If it's newMessageAction and asyncProcess is not active, dispatch it normally
        return next(action);
    };
};

function loadAsyncProcess(state: RootState) {
    // Load async process from right place
    let asyncProcess = state.messages.messageAsyncProcess;
    if (state.messages.currentConversation) {
        asyncProcess = checkConversationData(
            state.messages.conversationsData,
            state.messages.currentConversation.localId,
        )?.asyncProcess;
    }
    return asyncProcess;
}
