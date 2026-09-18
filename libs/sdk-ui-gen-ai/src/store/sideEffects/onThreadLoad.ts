// (C) 2024-2026 GoodData Corporation

import { all, call, cancelled, getContext, put, race, select, spawn, take } from "redux-saga/effects";

import {
    type IAnalyticalBackend,
    type IChatConversationItem,
    type IChatConversationItemsQueryResult,
    type IChatConversationThread,
    type IChatConversations,
} from "@gooddata/sdk-backend-spi";

import {
    type IChatConversationLocal,
    type IChatConversationLocalItem,
    makeConversationItem,
} from "../../model.js";
import {
    conversationMessagesByIdSelector,
    conversationSelector,
    conversationsLoadedSelector,
    conversationsSelector,
} from "../messages/messagesSelectors.js";
import {
    cancelAsyncAction,
    clearConversationLoadingAction,
    loadConversationSuccessAction,
    loadConversationsSuccessAction,
    loadThreadErrorAction,
} from "../messages/messagesSlice.js";
import { createEmptyConversation } from "../utils.js";

import { consumeStaleConversationSession } from "./conversationSession.js";
import { convertToLocalContent } from "./converters/toLocalContent.js";
import { notifyDefinitionReceived } from "./onDefinitionReceivedTrigger.js";

/**
 * Load thread history and put it to the store.
 * @internal
 */
export function* onThreadLoad() {
    // Remember which conversation this load marked as "loading" (loadThreadAction keyed the
    // flag to the conversation that was current when this saga was dispatched). If a newer
    // load supersedes us, takeLatest cancels this saga without dispatching cancelAsyncAction,
    // so we must clear that conversation's flag ourselves - otherwise its skeleton spins
    // forever when reopened (LX-2577).
    const loadingConversation: IChatConversationLocal | undefined = yield select(conversationSelector);
    const loadingConversationLocalId = loadingConversation?.localId;
    try {
        yield fetchConversations();
    } catch (e) {
        yield put(loadThreadErrorAction({ error: e as Error }));
    } finally {
        const wasCancelled: boolean = yield cancelled();
        if (wasCancelled) {
            // Only clear when the load was genuinely orphaned, i.e. the conversation we were
            // loading is no longer the current one (the user switched away mid-load). When a
            // newer load supersedes us on the SAME conversation - e.g. a split layout mounts
            // both GenAIConversations and GenAIAssistant and each useThreadLoading dispatches
            // loadThreadAction - the replacement saga has already re-set the "loading" flag and
            // is still fetching, so clearing it here would prematurely hide the skeleton and
            // re-enable the input.
            const currentConversation: IChatConversationLocal | undefined =
                yield select(conversationSelector);
            if (currentConversation?.localId !== loadingConversationLocalId) {
                yield put(
                    clearConversationLoadingAction({ conversationLocalId: loadingConversationLocalId }),
                );
            }
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

    // Preview always starts a brand-new conversation on mount. Preview conversations live under a
    // hidden, reused sandbox agent that has no history UI to prune them, so we also delete any
    // pre-existing ones. Deletion is spawned (detached) and fail-silent: it must never block or
    // break the chat, so we seed the fresh conversation without waiting for it. A detached task
    // also keeps the prune from being cancelled when takeLatest supersedes this load saga.
    if (isPreview) {
        const api = backend.workspace(workspace).genAI().getChatConversations({ isPreview });
        yield spawn(deletePreviewConversations, api, conversations);
        yield put(
            loadConversationSuccessAction({
                currentConversation: createEmptyConversation(),
                conversationItems: [],
            }),
        );
        return;
    }

    // New conversation selected
    if (conversation?.localId && !conversation.id) {
        yield put(
            loadConversationSuccessAction({
                currentConversation: conversation,
            }),
        );
        return;
    }

    // Opening after a long idle period starts a fresh conversation instead of resuming the last
    // one. Applies to an explicit pick too - selecting one refreshes the timer.
    const staleSession: boolean = yield call(consumeStaleConversationSession);
    if (staleSession) {
        yield put(
            loadConversationSuccessAction({
                currentConversation: createEmptyConversation(),
                conversationItems: [],
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

        const items = resultsItems.map((item) => {
            return makeConversationItem({
                ...item,
                content: convertToLocalContent(item.content),
            });
        });

        yield put(
            loadConversationSuccessAction({
                currentConversation: selectedConversation,
                conversationItems: [
                    // Drop unconfirmed optimistic system items: the backend returns the persisted version.
                    ...messages.filter((msg) => !(msg.role === "system" && msg.id === "")),
                    ...items,
                ],
                threadId: selectedConversation.id,
            }),
        );
        yield call(notifyDefinitionReceived, items, selectedConversation.localId);
    } else {
        yield put(
            loadConversationSuccessAction({
                currentConversation: createEmptyConversation(),
                conversationItems: [],
            }),
        );
    }
}

function* deletePreviewConversation(api: IChatConversations, conversationId: string) {
    try {
        yield call(api.delete.bind(api), conversationId);
    } catch {
        // Fail silently - a leftover preview conversation is cosmetic; cleanup must never
        // disrupt the chat.
    }
}

function* deletePreviewConversations(
    api: IChatConversations,
    conversations: IChatConversationLocal[] | undefined,
) {
    // Only the conversations already persisted on the backend. The fresh draft we seed alongside
    // this has no id and is not in this list, so it can never be swept.
    const persisted = (conversations ?? []).filter((conversation) => Boolean(conversation.id));
    yield all(persisted.map((conversation) => call(deletePreviewConversation, api, conversation.id)));
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
