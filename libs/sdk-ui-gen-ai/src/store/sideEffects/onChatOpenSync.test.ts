// (C) 2026 GoodData Corporation

import { type PayloadAction } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";

import { type IChatConversationLocal } from "../../model.js";
import { settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import {
    asyncProcessSelector,
    conversationMessagesSelector,
    conversationSelector,
    conversationsLoadedSelector,
} from "../messages/messagesSelectors.js";
import { setCurrentConversationAction, setMessagesAction } from "../messages/messagesSlice.js";

import { onChatOpenSync } from "./onChatOpenSync.js";

// Drives the saga generator without redux-saga's runtime: SELECT effects are answered from a
// per-selector queue (so a selector sampled twice can return different values across the await),
// CALL effects are answered in order from `callResults`, and PUT actions are collected.
function runOnChatOpenSync({
    isOpen,
    selects,
    callResults,
}: {
    isOpen: boolean;
    selects: Map<unknown, unknown[]>;
    callResults: unknown[];
}): PayloadAction[] {
    // Loosely typed so the manual driver can feed SELECT/CALL results into next() regardless of the
    // saga's inferred effect types.
    const gen: Generator<{ type: string; payload: any }, void, unknown> = onChatOpenSync({
        type: "x",
        payload: { isOpen },
    } as PayloadAction<{ isOpen: boolean }>) as unknown as Generator<
        { type: string; payload: any },
        void,
        unknown
    >;
    const puts: PayloadAction[] = [];
    let callIndex = 0;
    let next = gen.next();
    while (!next.done) {
        const effect = next.value as { type: string; payload: any };
        if (effect.type === "SELECT") {
            const queue = selects.get(effect.payload.selector);
            if (!queue || queue.length === 0) {
                throw new Error("Unexpected SELECT with no queued value");
            }
            next = gen.next(queue.shift());
        } else if (effect.type === "CALL") {
            const result = callResults[callIndex++];
            if (result instanceof Error) {
                next = gen.throw(result);
            } else {
                next = gen.next(result);
            }
        } else if (effect.type === "PUT") {
            puts.push(effect.payload.action);
            next = gen.next();
        } else {
            next = gen.next();
        }
    }
    return puts;
}

const conv = (id: string, localId = id): IChatConversationLocal =>
    ({ id, localId, updatedAt: "2026-01-01T00:00:00.000Z" }) as IChatConversationLocal;

const AGENTIC_SETTINGS = { enableAiAgenticConversations: true };

describe("onChatOpenSync", () => {
    it("syncs to the latest conversation when nothing changed during the fetch", () => {
        const latest = conv("conv-c");
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [latest, [{ id: "i1", localId: "i1" }], undefined],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [conversationsLoadedSelector, [true]],
                // sampled twice: pre-fetch guard, then post-fetch re-check
                [asyncProcessSelector, [undefined, undefined]],
                // current (pre-fetch) then currentNow (post-fetch) — both the persisted conv-a
                [conversationSelector, [conv("conv-a"), conv("conv-a")]],
                [conversationMessagesSelector, [[]]],
            ]),
        });

        const types = puts.map((a) => a.type);
        expect(types).toContain(setCurrentConversationAction.type);
        expect(types).toContain(setMessagesAction.type);
    });

    it("does NOT switch when a fresh draft was started during the fetch (LX-2577)", () => {
        const latest = conv("conv-b");
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [latest, [{ localId: "i1" }]],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [conversationsLoadedSelector, [true]],
                [asyncProcessSelector, [undefined, undefined]],
                // pre-fetch: previous persisted conversation; post-fetch: a fresh unsent draft (no id)
                [conversationSelector, [conv("conv-b"), conv("", "draft-1")]],
                [conversationMessagesSelector, [[]]],
            ]),
        });

        const types = puts.map((a) => a.type);
        expect(types).not.toContain(setCurrentConversationAction.type);
        expect(types).not.toContain(setMessagesAction.type);
    });

    it("updates messages when conversation is the same but items changed", () => {
        const current = conv("conv-a");
        const items = [
            { id: "i1", localId: "i1" },
            { id: "i2", localId: "i2" },
        ];
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [current, items, undefined],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [conversationsLoadedSelector, [true]],
                [asyncProcessSelector, [undefined, undefined]],
                [conversationSelector, [current, current]],
                [conversationMessagesSelector, [[{ id: "i1", localId: "i1" }]]],
            ]),
        });

        const types = puts.map((a) => a.type);
        expect(types).not.toContain(setCurrentConversationAction.type);
        expect(types).toContain(setMessagesAction.type);
    });

    it("does NOT update messages when conversation and items are the same", () => {
        const current = conv("conv-a");
        const items = [{ id: "i1", localId: "i1" }];
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [current, items],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [conversationsLoadedSelector, [true]],
                [asyncProcessSelector, [undefined, undefined]],
                [conversationSelector, [current, current]],
                [conversationMessagesSelector, [[{ id: "i1", localId: "i1" }]]],
            ]),
        });

        const types = puts.map((a) => a.type);
        expect(types).not.toContain(setCurrentConversationAction.type);
        expect(types).not.toContain(setMessagesAction.type);
    });

    it("does NOT switch or update when chat is opened but another process starts during fetch (LX-2577)", () => {
        const latest = conv("conv-b");
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [latest, [{ id: "i1", localId: "i1" }]],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [conversationsLoadedSelector, [true]],
                [asyncProcessSelector, [undefined, "evaluating"]], // process started during fetch
                [conversationSelector, [conv("conv-a"), conv("conv-a")]],
                [conversationMessagesSelector, [[]]],
            ]),
        });

        expect(puts).toHaveLength(0);
    });

    it("fails silently when backend call fails", () => {
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [new Error("Failed to fetch")],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [conversationsLoadedSelector, [true]],
                [asyncProcessSelector, [undefined, undefined]],
                [conversationSelector, [conv("conv-a"), conv("conv-a")]],
                [conversationMessagesSelector, [[]]],
            ]),
        });

        expect(puts).toHaveLength(0);
    });

    it("updates messages when backend returns FEWER items than cached", () => {
        const current = conv("conv-a");
        const items = [{ id: "i1", localId: "i1" }];
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [current, items, undefined],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [conversationsLoadedSelector, [true]],
                [asyncProcessSelector, [undefined, undefined]],
                [conversationSelector, [current, current]],
                [
                    conversationMessagesSelector,
                    [
                        [
                            { id: "i1", localId: "i1" },
                            { id: "i2", localId: "i2" },
                        ],
                    ],
                ],
            ]),
        });

        const types = puts.map((a) => a.type);
        expect(types).toContain(setMessagesAction.type);
    });

    it("updates messages when conversation switches even if item IDs match", () => {
        const current = conv("conv-a");
        const latest = conv("conv-b");
        const items = [{ id: "i1", localId: "i1" }];
        const puts = runOnChatOpenSync({
            isOpen: true,
            callResults: [latest, items, undefined],
            selects: new Map<unknown, unknown[]>([
                [settingsSelector, [AGENTIC_SETTINGS]],
                [conversationsLoadedSelector, [true]],
                [asyncProcessSelector, [undefined, undefined]],
                [conversationSelector, [current, current]],
                [conversationMessagesSelector, [[{ id: "i1", localId: "i1" }]]],
            ]),
        });

        const types = puts.map((a) => a.type);
        expect(types).toContain(setCurrentConversationAction.type);
        expect(types).toContain(setMessagesAction.type);
    });
});
