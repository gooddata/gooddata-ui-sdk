// (C) 2024-2026 GoodData Corporation

import { call, cancelled, getContext, put, race, select, take } from "redux-saga/effects";

import {
    type IAnalyticalBackend,
    type IChatConversationItem,
    type IChatConversationItemsQueryResult,
    type IChatConversationThread,
    type IChatThread,
    type IChatThreadHistory,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";

import {
    type AssistantMessage,
    type Contents,
    type IChatConversationLocal,
    type IChatConversationLocalItem,
    type Message,
    isAssistantMessage,
    isSemanticSearchContents,
    makeConversationItem,
} from "../../model.js";
import { settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import { loadMessages } from "../localStorage.js";
import {
    conversationMessagesByIdSelector,
    conversationSelector,
    conversationsLoadedSelector,
    conversationsSelector,
} from "../messages/messagesSelectors.js";
import {
    cancelAsyncAction,
    loadConversationSuccessAction,
    loadConversationsSuccessAction,
    loadThreadErrorAction,
    loadThreadSuccessAction,
    restoreCachedMessagesAction,
} from "../messages/messagesSlice.js";
import { createEmptyConversation } from "../utils.js";

import { interactionsToMessages } from "./converters/interactionsToMessages.js";
import { convertToLocalContent } from "./converters/toLocalContent.js";

/**
 * Load thread history and put it to the store.
 * @internal
 */
export function* onThreadLoad() {
    try {
        const settings: IUserWorkspaceSettings | undefined = yield select(settingsSelector);
        if (settings?.enableAiAgenticConversations) {
            yield fetchConversations();
        } else {
            yield fetchThread(settings);
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

//THREAD API

function* fetchThread(settings: IUserWorkspaceSettings | undefined) {
    // Retrieve backend from context
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
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

    if (!wasCancelled) {
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

//CONVERSATIONS API

function* fetchConversations() {
    // Load all conversations
    yield call(fetchAllConversations);
    // Load current conversation
    yield call(fetchCurrentConversation);
}

function* fetchAllConversations() {
    // Retrieve backend from context
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
    const isPreview: boolean | undefined = yield getContext("isPreview");

    const conversationsLoaded: boolean | undefined = yield select(conversationsLoadedSelector);

    // Already loaded
    if (conversationsLoaded) {
        return;
    }

    const api = backend.workspace(workspace).genAI().getChatConversations({ isPreview });
    const query = api.getConversationItemsQuery().withSize(100).withPage(0);

    const getConversations = query.query.bind(query);
    const [resultsConversations, cancelledConversations]: [
        results: IChatConversationItemsQueryResult,
        ReturnType<typeof cancelAsyncAction>,
    ] = yield race([call(getConversations), take(cancelAsyncAction.type)]);

    //Canceled during the loading
    if (cancelledConversations) {
        return;
    }

    const conversationItems = resultsConversations.items.map((item) => {
        return {
            ...item,
            localId: item.id,
        };
    });
    yield put(
        loadConversationsSuccessAction({
            conversations: conversationItems,
        }),
    );
}

function* fetchCurrentConversation() {
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
    const isPreview: boolean | undefined = yield getContext("isPreview");

    const conversations: IChatConversationLocal[] | undefined = yield select(conversationsSelector);
    const conversation: IChatConversationLocal | undefined = yield select(conversationSelector);

    // New conversation selected
    if (conversation?.localId && !conversation.id) {
        yield put(
            loadConversationSuccessAction({
                currentConversation: conversation,
            }),
        );
        return;
    }

    const api = backend.workspace(workspace).genAI().getChatConversations({ isPreview });

    //Sort by createion date, because normally there are pinned on top
    const sortedConv = conversations
        ?.slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    //Load the first conversation if there are any or create a new one
    const selectedConversation = conversation ?? sortedConv?.[0] ?? undefined;
    if (selectedConversation) {
        const preparedThread = api.getConversationThread(selectedConversation.id);
        const [resultsItems, cancelledItems]: [
            results: IChatConversationItem[],
            ReturnType<typeof cancelAsyncAction>,
        ] = yield race([call(fetchConversationHistory, preparedThread), take(cancelAsyncAction.type)]);

        //Canceled during the loading
        if (cancelledItems) {
            return;
        }

        //Load previously created messages
        const messages: IChatConversationLocalItem[] = yield select(
            conversationMessagesByIdSelector,
            selectedConversation.localId,
        );

        yield put(
            loadConversationSuccessAction({
                currentConversation: selectedConversation,
                conversationItems: [
                    ...messages,
                    ...resultsItems.map((item) => {
                        return makeConversationItem({
                            ...item,
                            content: convertToLocalContent(item.content),
                        });
                    }),
                ],
                threadId: selectedConversation.id,
            }),
        );
    } else {
        yield put(
            loadConversationSuccessAction({
                currentConversation: createEmptyConversation(),
                conversationItems: [],
            }),
        );
    }
}

function* fetchConversationHistory(preparedChatThread: IChatConversationThread) {
    const controller = new AbortController();
    try {
        const results: IChatConversationItem[] = yield call(
            preparedChatThread.loadHistory.bind(preparedChatThread),
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
