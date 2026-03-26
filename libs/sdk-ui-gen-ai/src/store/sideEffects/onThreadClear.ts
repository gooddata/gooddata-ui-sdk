// (C) 2024-2026 GoodData Corporation

import { call, getContext, put, race, select, take } from "redux-saga/effects";

import {
    type IAnalyticalBackend,
    type IChatConversation,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";

import { settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import { threadIdSelector } from "../messages/messagesSelectors.js";
import {
    cancelAsyncAction,
    clearConversationSuccessAction,
    clearThreadErrorAction,
    clearThreadSuccessAction,
} from "../messages/messagesSlice.js";

/**
 * Load thread history and put it to the store.
 * @internal
 */
export function* onThreadClear() {
    try {
        const settings: IUserWorkspaceSettings | undefined = yield select(settingsSelector);
        if (settings?.enableAiAgenticConversations) {
            yield resetConversation();
        } else {
            yield resetThread();
        }
    } catch (e) {
        yield put(clearThreadErrorAction({ error: e as Error }));
    }
}

//THREAD API

function* resetThread() {
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
    } else {
        yield put(clearThreadSuccessAction());
    }
}

//CONVERSATIONS API

function* resetConversation() {
    // Retrieve backend from context
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");

    const conversationId: string = yield select(threadIdSelector);

    const chatThread = backend
        .workspace(workspace)
        .genAI()
        .getChatConversations()
        .getConversationThread(conversationId);

    const [results, cancelAction]: [results: IChatConversation, ReturnType<typeof cancelAsyncAction>] =
        yield race([call(chatThread.reset.bind(chatThread)), take(cancelAsyncAction.type)]);

    if (cancelAction) {
        // Just skip, as the action was cancelled
    } else {
        yield put(
            clearConversationSuccessAction({
                conversation: results,
                threadId: results.id,
            }),
        );
    }
}
