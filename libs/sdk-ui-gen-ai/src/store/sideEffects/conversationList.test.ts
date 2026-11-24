// (C) 2026 GoodData Corporation

import { type UnknownAction, configureStore } from "@reduxjs/toolkit";
import { CANCEL, runSaga, stdChannel } from "redux-saga";
import { describe, expect, it, vi } from "vitest";

import { type IChatConversation, type IChatConversations } from "@gooddata/sdk-backend-spi";

import { type IChatConversationLocal } from "../../model.js";
import { chatWindowSliceReducer } from "../chatWindow/chatWindowSlice.js";
import {
    cancelAsyncAction,
    loadConversationsSuccessAction,
    loadThreadErrorAction,
    messagesSliceReducer,
} from "../messages/messagesSlice.js";

import { fetchConversationList, getLatestConversation } from "./conversationList.js";
import { onChatOpenSync } from "./onChatOpenSync.js";
import { onThreadLoad } from "./onThreadLoad.js";

function conversation(id: string, updatedAt: string, pinned = false): IChatConversation {
    return { id, title: id, createdAt: "2026-01-01T00:00:00Z", updatedAt, pinned, agentId: "agent-1" };
}

const older = conversation("older", "2026-01-02T00:00:00Z", true);
const newer = conversation("newer", "2026-03-01T00:00:00Z");
const tied = conversation("tied", newer.updatedAt);
const cached: IChatConversationLocal = {
    ...conversation("cached", "2026-01-01T00:00:00Z"),
    localId: "runtime-cached",
};

function createHarness(
    flow: "initial" | "reopen",
    items: IChatConversation[],
    current: IChatConversationLocal | undefined = flow === "reopen" ? cached : undefined,
    isPreview?: boolean,
) {
    const store = configureStore({
        reducer: { messages: messagesSliceReducer, chatWindow: chatWindowSliceReducer },
        preloadedState: {
            messages: {
                ...messagesSliceReducer(undefined, { type: "init" }),
                loaded: flow === "reopen",
                conversationsLoaded: flow === "reopen",
                currentConversation: current,
                conversations: current ? [current] : [],
            },
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActionPaths: ["payload.error"],
                },
            }),
    });
    const pageQuery = { query: vi.fn(async () => ({ items })) };
    const sizeQuery = { withPage: vi.fn(() => pageQuery) };
    const query = { withSize: vi.fn(() => sizeQuery) };
    const getConversationItemsQuery = vi.fn(() => query);
    const loadHistory = vi.fn(async () => []);
    const getConversationThread = vi.fn(() => ({ loadHistory }));
    const api = { getConversationItemsQuery, getConversationThread, delete: vi.fn(async () => {}) };
    const getChatConversations = vi.fn(() => api);
    const workspace = vi.fn(() => ({ genAI: () => ({ getChatConversations }) }));
    const channel = stdChannel<UnknownAction>();
    const dispatch = vi.fn((action: UnknownAction) => store.dispatch(action));
    const run = () => {
        const options = {
            context: { backend: { workspace }, workspace: "workspace-1", isPreview },
            dispatch,
            getState: store.getState,
            channel,
        };
        return flow === "initial"
            ? runSaga(options, onThreadLoad)
            : runSaga(options, onChatOpenSync, { type: "open", payload: { isOpen: true } });
    };

    return {
        store,
        pageQuery,
        sizeQuery,
        query,
        api,
        workspace,
        getChatConversations,
        dispatch,
        channel,
        run,
    };
}

describe.each(["initial", "reopen"] as const)("%s conversation-list loading", (flow) => {
    it("maps the first page without reordering metadata and picks the first newest conversation", async () => {
        const items = [older, newer, tied];
        const before = structuredClone(items);
        const harness = createHarness(flow, items);

        await harness.run().toPromise();

        const expected = items.map((item) => ({ ...item, localId: item.id }));
        expect(harness.workspace).toHaveBeenCalledWith("workspace-1");
        expect(harness.getChatConversations).toHaveBeenCalledWith({ isPreview: undefined });
        expect(harness.api.getConversationItemsQuery).toHaveBeenCalledOnce();
        expect(harness.query.withSize).toHaveBeenCalledExactlyOnceWith(100);
        expect(harness.sizeQuery.withPage).toHaveBeenCalledExactlyOnceWith(0);
        expect(harness.pageQuery.query).toHaveBeenCalledOnce();
        expect(harness.pageQuery.query.mock.contexts[0]).toBe(harness.pageQuery);
        expect(harness.dispatch).toHaveBeenCalledWith(
            loadConversationsSuccessAction({ conversations: expected }),
        );
        expect(harness.store.getState().messages.conversations).toEqual(expected);
        expect(harness.api.getConversationThread).toHaveBeenCalledExactlyOnceWith(newer.id);
        expect(harness.store.getState().messages.currentConversation).toEqual(expected[1]);
        expect(items).toEqual(before);
    });

    it("keeps the active conversation ahead of newer entries and preserves its runtime local ID", async () => {
        const active = { ...older, localId: "runtime-older" };
        const harness = createHarness(flow, [older, newer], active);

        await harness.run().toPromise();

        expect(harness.api.getConversationThread).toHaveBeenCalledExactlyOnceWith(older.id);
        expect(harness.store.getState().messages.currentConversation).toEqual(active);
        expect(harness.store.getState().messages.conversations).toEqual([
            active,
            { ...newer, localId: newer.id },
        ]);
    });

    it.each([false, true])("forwards preview configuration %s to the list API", async (isPreview) => {
        const harness = createHarness(flow, [older], undefined, isPreview);

        await harness.run().toPromise();

        expect(harness.getChatConversations).toHaveBeenCalledWith({ isPreview });
        expect(harness.api.getConversationItemsQuery).toHaveBeenCalledOnce();
    });

    it("only skips a previously loaded list on initial loading", async () => {
        const harness = createHarness(flow, [older]);

        await harness.run().toPromise();
        await harness.run().toPromise();

        expect(harness.api.getConversationItemsQuery).toHaveBeenCalledTimes(flow === "initial" ? 1 : 2);
    });
});

describe("conversation-list policies", () => {
    it("commits an empty list and starts a draft on initial loading", async () => {
        const harness = createHarness("initial", []);

        await harness.run().toPromise();

        expect(harness.api.getConversationThread).not.toHaveBeenCalled();
        expect(harness.dispatch).toHaveBeenCalledWith(loadConversationsSuccessAction({ conversations: [] }));
        expect(harness.store.getState().messages.currentConversation).toMatchObject({ id: "" });
        expect(harness.store.getState().messages.loaded).toBe(true);
    });

    it("does not replace the stored list or thread with an empty result on reopen", async () => {
        const harness = createHarness("reopen", []);
        const before = harness.store.getState();

        await harness.run().toPromise();

        expect(harness.api.getConversationThread).not.toHaveBeenCalled();
        expect(harness.dispatch).not.toHaveBeenCalled();
        expect(harness.store.getState()).toBe(before);
    });

    it("reports a list-query error on initial loading without committing a list", async () => {
        const consoleError = vi.spyOn(console, "error");
        const harness = createHarness("initial", [older]);
        const error = new Error("List unavailable");
        harness.pageQuery.query.mockRejectedValueOnce(error);

        await harness.run().toPromise();

        expect(harness.api.getConversationThread).not.toHaveBeenCalled();
        expect(harness.dispatch.mock.calls).toEqual([[loadThreadErrorAction({ error })]]);
        expect(harness.store.getState().messages).toMatchObject({
            globalError: { message: error.message },
            loaded: true,
            conversationsLoaded: true,
            conversations: [],
        });
        expect(consoleError).not.toHaveBeenCalled();
    });

    it("leaves the list and messages untouched when the list query fails on reopen", async () => {
        const harness = createHarness("reopen", [older]);
        const before = harness.store.getState();
        harness.pageQuery.query.mockRejectedValueOnce(new Error("List unavailable"));

        await harness.run().toPromise();

        expect(harness.api.getConversationThread).not.toHaveBeenCalled();
        expect(harness.dispatch).not.toHaveBeenCalled();
        expect(harness.store.getState()).toBe(before);
    });
});

it("does not commit an initial list request that completes after cancellation", async () => {
    const harness = createHarness("initial", [older]);
    let finishQuery!: (result: { items: IChatConversation[] }) => void;
    const cancelQuery = vi.fn();
    harness.pageQuery.query.mockImplementationOnce(() =>
        Object.assign(
            new Promise<{ items: IChatConversation[] }>((resolve) => {
                finishQuery = resolve;
            }),
            { [CANCEL]: cancelQuery },
        ),
    );

    const task = harness.run();
    expect(harness.pageQuery.query).toHaveBeenCalledOnce();
    harness.channel.put(cancelAsyncAction());
    await task.toPromise();
    finishQuery({ items: [older] });
    await Promise.resolve();

    expect(cancelQuery).toHaveBeenCalledOnce();
    expect(harness.dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: loadConversationsSuccessAction.type }),
    );
    expect(harness.api.getConversationThread).not.toHaveBeenCalled();
    expect(harness.store.getState().messages.conversations).toEqual([]);
});

describe("fetchConversationList", () => {
    it("copies metadata in response order and derives local IDs without mutating the response", async () => {
        const items = [older, newer, { ...tied, localId: "not-the-server-id" }];
        const before = structuredClone(items);
        const harness = createHarness("initial", items);

        const result: IChatConversationLocal[] = await runSaga(
            {},
            fetchConversationList,
            harness.api as unknown as IChatConversations,
        ).toPromise();

        expect(result).toStrictEqual(items.map((item) => ({ ...item, localId: item.id })));
        expect(result).not.toBe(items);
        result.forEach((item, index) => expect(item).not.toBe(items[index]));
        expect(items).toStrictEqual(before);
        expect(harness.query.withSize).toHaveBeenCalledExactlyOnceWith(100);
        expect(harness.sizeQuery.withPage).toHaveBeenCalledExactlyOnceWith(0);
        expect(harness.pageQuery.query.mock.contexts[0]).toBe(harness.pageQuery);
        expect(harness.dispatch).not.toHaveBeenCalled();
    });

    it("returns an empty list for an empty page", async () => {
        const harness = createHarness("initial", []);

        await expect(
            runSaga({}, fetchConversationList, harness.api as unknown as IChatConversations).toPromise(),
        ).resolves.toEqual([]);
    });

    it.each(["creation", "request"] as const)("propagates query %s errors unchanged", async (stage) => {
        const harness = createHarness("initial", []);
        const error = new Error("List unavailable");
        if (stage === "creation") {
            harness.api.getConversationItemsQuery.mockImplementationOnce(() => {
                throw error;
            });
        } else {
            harness.pageQuery.query.mockRejectedValueOnce(error);
        }

        await expect(
            runSaga(
                { onError: vi.fn() },
                fetchConversationList,
                harness.api as unknown as IChatConversations,
            ).toPromise(),
        ).rejects.toBe(error);
        expect(harness.dispatch).not.toHaveBeenCalled();
    });
});

describe("getLatestConversation", () => {
    const localOlder = { ...older, localId: "local-older" };
    const localNewer = { ...newer, localId: "local-newer" };
    const localTied = { ...tied, localId: "local-tied" };

    it.each([
        { name: "undefined", items: undefined, expected: undefined },
        { name: "empty", items: [], expected: undefined },
        { name: "singleton", items: [localOlder], expected: localOlder },
        { name: "pinned first", items: [localOlder, localNewer], expected: localNewer },
        { name: "newest first", items: [localNewer, localOlder], expected: localNewer },
        { name: "equal timestamps", items: [localOlder, localTied, localNewer], expected: localTied },
    ])("preserves $name selection without mutating the list", ({ items, expected }) => {
        const input = items ? Object.freeze([...items]) : undefined;

        expect(getLatestConversation(input)).toBe(expected);
        expect(input).toEqual(items);
    });
});
