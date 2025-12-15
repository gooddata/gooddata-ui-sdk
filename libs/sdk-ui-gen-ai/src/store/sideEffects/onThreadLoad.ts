// (C) 2024-2025 GoodData Corporation

import { call, cancelled, getContext, put, race, select, take } from "redux-saga/effects";

import {
    type IAnalyticalBackend,
    type IChatThread,
    type IChatThreadHistory,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";

import { interactionsToMessages } from "./converters/interactionsToMessages.js";
import { extractError } from "./utils.js";
import { settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import {
    cancelAsyncAction,
    loadThreadErrorAction,
    loadThreadSuccessAction,
} from "../messages/messagesSlice.js";

/**
 * Load thread history and put it to the store.
 * @internal
 */
export function* onThreadLoad() {
    try {
        // Retrieve backend from context
        const backend: IAnalyticalBackend = yield getContext("backend");
        const workspace: string = yield getContext("workspace");
        const settings: IUserWorkspaceSettings | undefined = yield select(settingsSelector);
        const showReasoning = Boolean(settings?.enableGenAIReasoningVisibility);

        const chatThread = backend.workspace(workspace).genAI().getChatThread();

        const [results, cancelled]: [results: IChatThreadHistory, ReturnType<typeof cancelAsyncAction>] =
            yield race([call(fetchChatHistory, chatThread), take(cancelAsyncAction.type)]);

        if (cancelled) {
            // TODO - cancelled during the loading
        } else {
            yield put(
                loadThreadSuccessAction({
                    messages: interactionsToMessages(results?.interactions ?? [], { showReasoning }),
                    threadId: results?.threadId ?? "",
                }),
            );
        }
    } catch (e) {
        yield put(loadThreadErrorAction({ error: extractError(e) }));
    }
}

function* fetchChatHistory(preparedChatThread: IChatThread) {
    const controller = new AbortController();
    try {
        const results: IChatThreadHistory = yield call(
            preparedChatThread.loadHistory.bind(preparedChatThread),
            undefined,
            { signal: controller.signal },
        );

        return results;
    } finally {
        const wasCancelled: boolean = yield cancelled();

        if (wasCancelled) {
            controller.abort();
        }
    }
}
