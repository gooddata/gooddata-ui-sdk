// (C) 2024-2026 GoodData Corporation

import { call, cancelled, getContext, put, race, select, take } from "redux-saga/effects";

import {
    type IAnalyticalBackend,
    type IChatThread,
    type IChatThreadHistory,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";

import { interactionsToMessages } from "./converters/interactionsToMessages.js";
import {
    type AssistantMessage,
    type Contents,
    type Message,
    isAssistantMessage,
    isSemanticSearchContents,
} from "../../model.js";
import { settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import { loadMessages } from "../localStorage.js";
import {
    cancelAsyncAction,
    loadThreadErrorAction,
    loadThreadSuccessAction,
    restoreCachedMessagesAction,
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

        // Immediately restore cached messages so the UI doesn't flash empty while backend loads.
        // Uses restoreCachedMessagesAction which shows messages but keeps loaded=false,
        // preventing useThreadLoading from cancelling the in-progress backend fetch.
        const cachedMessages = loadMessages(workspace);
        if (cachedMessages?.length) {
            yield put(restoreCachedMessagesAction({ messages: cachedMessages }));
        }

        const chatThread = backend.workspace(workspace).genAI().getChatThread();

        const [results, wasCancelled]: [results: IChatThreadHistory, ReturnType<typeof cancelAsyncAction>] =
            yield race([call(fetchChatHistory, chatThread), take(cancelAsyncAction.type)]);

        if (wasCancelled) {
            // TODO - cancelled during the loading
        } else {
            const backendMessages = interactionsToMessages(results?.interactions ?? [], { showReasoning });

            // Merge: preserve semanticSearch content from cached messages when the backend omits it.
            const mergedMessages = cachedMessages?.length
                ? mergeWithCache(backendMessages, cachedMessages)
                : backendMessages;

            yield put(
                loadThreadSuccessAction({
                    messages: mergedMessages,
                    threadId: results?.threadId ?? "",
                }),
            );
        }
    } catch (e) {
        yield put(loadThreadErrorAction({ error: e as Error }));
    }
}

/**
 * Merge backend-loaded messages with cached messages.
 * For each assistant message from the backend, if its content is missing semanticSearch
 * data but the corresponding cached message has it, the cached content is preserved.
 * Matching is done by the server-side interaction ID (message.id).
 * @internal
 */
export function mergeWithCache(backendMessages: Message[], cachedMessages: Message[]): Message[] {
    // Build a lookup of cached assistant messages by their server-side interaction ID.
    const cachedById = new Map<string, AssistantMessage>();
    for (const msg of cachedMessages) {
        if (isAssistantMessage(msg) && msg.id) {
            cachedById.set(msg.id, msg);
        }
    }

    return backendMessages.map((msg) => {
        if (!isAssistantMessage(msg) || !msg.id) {
            return msg;
        }

        const cached = cachedById.get(msg.id);
        if (!cached) {
            return msg;
        }

        // Check if the backend message is missing semanticSearch content but the cache has it.
        const backendHasSemanticSearch = msg.content.some(isSemanticSearchContents);
        const cachedSemanticSearchContents = cached.content.filter(isSemanticSearchContents);

        if (!backendHasSemanticSearch && cachedSemanticSearchContents.length > 0) {
            // Inject cached semanticSearch contents into the backend message.
            const mergedContent: Contents[] = [...msg.content, ...cachedSemanticSearchContents];
            return { ...msg, content: mergedContent };
        }

        return msg;
    });
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
