// (C) 2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { call, getContext, put, select } from "redux-saga/effects";

import {
    type IAnalyticalBackend,
    type IChatConversationItem,
    type IChatConversationItemsQueryResult,
    type IUserWorkspaceSettings,
} from "@gooddata/sdk-backend-spi";

import {
    type IChatConversationLocal,
    type IChatConversationLocalItem,
    makeConversationItem,
} from "../../model.js";
import { settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import {
    asyncProcessSelector,
    conversationSelector,
    conversationsLoadedSelector,
} from "../messages/messagesSelectors.js";
import {
    loadConversationsSuccessAction,
    setCurrentConversationAction,
    setMessagesAction,
} from "../messages/messagesSlice.js";

import { convertToLocalContent } from "./converters/toLocalContent.js";

/**
 * Re-sync the active conversation with the backend whenever the chat window is opened.
 *
 * The host shell hosts several micro-frontends (Catalog, Metric editor, Analytical Designer) and
 * keeps their runtimes alive across client-side navigation. Each runtime owns its own GenAI redux
 * store, which is only populated once on initial mount. As a result, a conversation started or
 * switched to on one micro-frontend was not reflected on another until a full page reload.
 *
 * When the chat is (re)opened we re-fetch the conversation list from the backend and, if another
 * conversation has become the most recently active one, switch to it. We then re-fetch the active
 * thread from the backend and replace the cached messages atomically so that messages created on
 * another micro-frontend show up even when this runtime already had the conversation cached. This
 * keeps the conversation and its messages in sync across host navigation without requiring a manual
 * reload. A flaky/empty backend response never clears what the user is currently looking at.
 *
 * Only runs in agentic conversations mode and only after the initial load finished. A brand-new
 * unsent draft conversation or an in-progress message exchange is never replaced.
 * @internal
 */
export function* onChatOpenSync({ payload: { isOpen } }: PayloadAction<{ isOpen: boolean }>) {
    // Only act when the chat is being opened.
    if (!isOpen) {
        return;
    }

    const settings: IUserWorkspaceSettings | undefined = yield select(settingsSelector);
    // Only the agentic conversations flow keeps a list of conversations on the backend.
    if (!settings?.enableAiAgenticConversations) {
        return;
    }

    // The very first open is handled by the regular thread loading; only re-sync afterwards.
    const conversationsLoaded: boolean = yield select(conversationsLoadedSelector);
    if (!conversationsLoaded) {
        return;
    }

    // Do not interrupt a genuine in-flight exchange. We deliberately only bail on "evaluating"
    // (a user message is being processed) and "clearing" (the user is resetting the thread).
    // "loading"/"restoring" merely indicate the initial thread load that useThreadLoading kicks
    // off on (re)open - that load happens *before* setOpenAction in the same render commit, so
    // treating it as "in progress" here would suppress every legitimate open-sync. Re-syncing in
    // that state is safe: we fetch the thread ourselves and replace the messages atomically once it
    // resolves, which supersedes whatever the concurrent initial load produces.
    const asyncProcess: ReturnType<typeof asyncProcessSelector> = yield select(asyncProcessSelector);
    if (asyncProcess === "evaluating" || asyncProcess === "clearing") {
        return;
    }

    const current: IChatConversationLocal | undefined = yield select(conversationSelector);
    // Keep a brand-new, not-yet-persisted draft conversation as-is.
    if (current && !current.id) {
        return;
    }

    try {
        const latest: IChatConversationLocal | undefined = yield call(fetchLatestConversation);

        // Empty (or transient) backend result - most likely a flaky list fetch. Keep the current UI
        // (list + thread) untouched rather than half-clearing it. fetchLatestConversation already
        // refrains from clobbering the stored list in this case, so there is nothing to reconcile.
        if (!latest) {
            return;
        }

        // Fetch the latest thread from the backend FIRST, then commit the result atomically.
        //
        // We deliberately do this before touching the store. The previous implementation cleared the
        // cached messages and dispatched loadThreadAction to reload them, but that had two problems:
        //  - a failed reload left the user staring at an empty thread (the cache was already wiped),
        //  - it relied on switching the conversation first, which flips loaded=false and lets
        //    useThreadLoading kick off its own concurrent onThreadLoad - an append-based load that
        //    could duplicate history against ours.
        //
        // Fetching first and only then dispatching means: on failure the catch below leaves the
        // previously loaded messages untouched, and on success we apply the switch and the messages
        // back-to-back without yielding, so loaded never transiently flips to false and no concurrent
        // load is triggered. The item list is built purely from the backend response (we do NOT append
        // to existing cached items), so re-creating items with fresh localIds cannot duplicate history.
        const items: IChatConversationLocalItem[] = yield call(fetchConversationItems, latest.id);

        // Switch to the latest conversation if it differs from the current one. setMessagesAction
        // writes into whatever currentConversation points at, so the switch must come first - and
        // both puts are dispatched synchronously (no yield between them) so the UI never observes the
        // intermediate empty/unloaded state.
        if (latest.id !== current?.id) {
            yield put(setCurrentConversationAction({ conversation: latest }));
        }
        yield put(setMessagesAction({ items }));
    } catch {
        // Fail silently - keep showing whatever is currently loaded.
    }
}

/**
 * Re-fetch the conversation list and return the most recently updated conversation.
 *
 * Only refreshes the stored list when the backend actually returns conversations. An empty result
 * is treated as transient and left to the caller, so we never clear the history panel while the
 * chat still shows a thread (which would be an inconsistent half-cleared state).
 * @internal
 */
function* fetchLatestConversation() {
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
    const isPreview: boolean | undefined = yield getContext("isPreview");

    const api = backend.workspace(workspace).genAI().getChatConversations({ isPreview });
    const query = api.getConversationItemsQuery().withSize(100).withPage(0);
    const getConversations = query.query.bind(query);

    const results: IChatConversationItemsQueryResult = yield call(getConversations);
    const conversations = results.items.map((item) => ({ ...item, localId: item.id }));

    // Nothing on the backend - do not clobber the stored list; keep whatever is currently shown.
    if (conversations.length === 0) {
        return undefined;
    }

    // Refresh the stored list so the history panel reflects the latest state too.
    yield put(loadConversationsSuccessAction({ conversations }));

    return conversations
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
}

/**
 * Fetch the thread history for the given conversation and convert it to local items.
 *
 * Mirrors how onThreadLoad's fetchCurrentConversation builds items from the backend response, but
 * intentionally returns ONLY the backend items (no merge/append with cached items) so the caller can
 * replace the cached history wholesale without duplicating it.
 * @internal
 */
function* fetchConversationItems(conversationId: string) {
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
    const isPreview: boolean | undefined = yield getContext("isPreview");

    const api = backend.workspace(workspace).genAI().getChatConversations({ isPreview });
    const preparedThread = api.getConversationThread(conversationId);
    const loadHistory = preparedThread.loadHistory.bind(preparedThread);

    const results: IChatConversationItem[] = yield call(loadHistory);

    return results.map((item) =>
        makeConversationItem({
            ...item,
            content: convertToLocalContent(item.content),
        }),
    );
}
