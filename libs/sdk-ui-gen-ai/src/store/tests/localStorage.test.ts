// (C) 2026 GoodData Corporation

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Message } from "../../model.js";
import { clearCachedMessages, loadMessages, saveMessages } from "../localStorage.js";

const WORKSPACE_ID = "test-workspace";
const KEY = `gd-gen-ai-messages-${WORKSPACE_ID}`;

const makeMessage = (overrides: Partial<Message> = {}): Message =>
    ({
        localId: "local-1",
        id: "server-1",
        created: 1000,
        cancelled: false,
        complete: true,
        role: "assistant",
        content: [{ type: "text", text: "Hello" }],
        feedback: "NONE",
        ...overrides,
    }) as Message;

describe("localStorage utilities", () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    afterEach(() => {
        sessionStorage.clear();
        vi.restoreAllMocks();
    });

    describe("saveMessages", () => {
        it("serializes messages to sessionStorage keyed by workspace", () => {
            const messages = [makeMessage()];
            saveMessages(WORKSPACE_ID, messages);

            const raw = sessionStorage.getItem(KEY);
            expect(raw).not.toBeNull();
            expect(JSON.parse(raw!)).toEqual(messages);
        });

        it("stores separate caches per workspace", () => {
            const msgs1 = [makeMessage({ localId: "a", id: "a" })];
            const msgs2 = [makeMessage({ localId: "b", id: "b" })];

            saveMessages("ws-1", msgs1);
            saveMessages("ws-2", msgs2);

            expect(JSON.parse(sessionStorage.getItem("gd-gen-ai-messages-ws-1")!)).toEqual(msgs1);
            expect(JSON.parse(sessionStorage.getItem("gd-gen-ai-messages-ws-2")!)).toEqual(msgs2);
        });

        it("silently swallows serialization errors", () => {
            const circularMsg: any = { localId: "x" };
            circularMsg.self = circularMsg;

            expect(() => saveMessages(WORKSPACE_ID, [circularMsg])).not.toThrow();
        });
    });

    describe("loadMessages", () => {
        it("returns undefined when nothing is cached", () => {
            expect(loadMessages(WORKSPACE_ID)).toBeUndefined();
        });

        it("returns deserialized messages after saving", () => {
            const messages = [makeMessage()];
            saveMessages(WORKSPACE_ID, messages);

            const loaded = loadMessages(WORKSPACE_ID);
            expect(loaded).toEqual(messages);
        });

        it("returns undefined when sessionStorage contains invalid JSON", () => {
            sessionStorage.setItem(KEY, "not-json{{{");
            expect(loadMessages(WORKSPACE_ID)).toBeUndefined();
        });
    });

    describe("clearCachedMessages", () => {
        it("removes the cached messages for the workspace", () => {
            saveMessages(WORKSPACE_ID, [makeMessage()]);
            expect(sessionStorage.getItem(KEY)).not.toBeNull();

            clearCachedMessages(WORKSPACE_ID);
            expect(sessionStorage.getItem(KEY)).toBeNull();
        });

        it("does not affect other workspaces", () => {
            saveMessages("ws-1", [makeMessage({ localId: "a", id: "a" })]);
            saveMessages("ws-2", [makeMessage({ localId: "b", id: "b" })]);

            clearCachedMessages("ws-1");

            expect(sessionStorage.getItem("gd-gen-ai-messages-ws-1")).toBeNull();
            expect(sessionStorage.getItem("gd-gen-ai-messages-ws-2")).not.toBeNull();
        });
    });
});
