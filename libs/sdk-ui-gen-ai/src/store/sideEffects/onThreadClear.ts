// (C) 2024 GoodData Corporation

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { call, getContext, put, race, take } from "redux-saga/effects";
import {
    cancelAsyncAction,
    clearThreadErrorAction,
    clearThreadSuccessAction,
} from "../messages/messagesSlice.js";
import { extractError } from "./utils.js";

/**
 * Load thread history and put it to the store.
 * @internal
 */
export function* onThreadClear() {
    try {
        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");

        const chatThread = backend.workspace(workspace).genAI().getChatThread();

        const [_results, cancelAction]: [results: void, ReturnType<typeof cancelAsyncAction>] = yield race([
            call(chatThread.reset.bind(chatThread)),
            take(cancelAsyncAction.type),
        ]);

        if (cancelAction) {
            // Just skip, as the action was cancelled
            // TODO
        } else {
            yield put(clearThreadSuccessAction());
        }
    } catch (e) {
        yield put(clearThreadErrorAction({ error: extractError(e) }));
    }
}
