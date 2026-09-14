// (C) 2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { settingsSelector } from "../chatWindow/chatWindowSelectors.js";
import { getLastActiveAt } from "../localStorage.js";

import {
    CONVERSATION_SESSION_TIMEOUT_MS,
    consumeStaleConversationSession,
    isConversationSessionStale,
    touchConversationSession,
} from "./conversationSession.js";

const WORKSPACE = "ws-1";
const NOW = 1_800_000_000_000;
const MULTI_SETTINGS = {
    enableAiAgenticConversations: true,
    enableAiAgenticMultiConversations: true,
};

function runConsume(settings: unknown): boolean {
    const gen = consumeStaleConversationSession();
    const selectors: unknown[] = [];
    let next = gen.next();
    while (!next.done) {
        const effect = next.value as { type: string; payload: any };
        if (effect.type === "SELECT") {
            selectors.push(effect.payload.selector);
            next = gen.next(settings);
        } else if (effect.type === "GET_CONTEXT") {
            next = gen.next(WORKSPACE);
        } else {
            next = gen.next();
        }
    }
    expect(selectors).toEqual([settingsSelector]);
    return next.value;
}

describe("conversation session staleness", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe("isConversationSessionStale", () => {
        it("is stale once the inactivity window elapsed", () => {
            touchConversationSession(WORKSPACE, NOW - CONVERSATION_SESSION_TIMEOUT_MS - 1);

            expect(isConversationSessionStale(WORKSPACE, NOW)).toBe(true);
        });

        it("is not stale within the inactivity window", () => {
            touchConversationSession(WORKSPACE, NOW - CONVERSATION_SESSION_TIMEOUT_MS + 1);

            expect(isConversationSessionStale(WORKSPACE, NOW)).toBe(false);
        });

        it("is not stale when no timestamp is stored, to keep the previous resume behaviour", () => {
            expect(isConversationSessionStale(WORKSPACE, NOW)).toBe(false);
        });

        it("tracks workspaces separately", () => {
            touchConversationSession("ws-other", NOW - CONVERSATION_SESSION_TIMEOUT_MS - 1);

            expect(isConversationSessionStale(WORKSPACE, NOW)).toBe(false);
        });
    });

    describe("consumeStaleConversationSession", () => {
        const longAgo = () => Date.now() - CONVERSATION_SESSION_TIMEOUT_MS - 1;

        it("reports a stale session and refreshes the timer, so a repeated open agrees", () => {
            touchConversationSession(WORKSPACE, longAgo());

            expect(runConsume(MULTI_SETTINGS)).toBe(true);
            expect(runConsume(MULTI_SETTINGS)).toBe(false);
        });

        it("never reports stale outside the multi-conversation flow", () => {
            const stored = longAgo();
            touchConversationSession(WORKSPACE, stored);

            expect(runConsume({ enableAiAgenticConversations: true })).toBe(false);
            expect(getLastActiveAt(WORKSPACE)).toBe(stored);
        });
    });
});
