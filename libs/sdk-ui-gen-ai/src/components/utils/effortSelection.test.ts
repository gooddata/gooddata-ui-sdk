// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type GenAIChatEffort } from "@gooddata/sdk-model";

import { type IChatConversationLocalItem } from "../../model.js";

import { DEFAULT_EFFORT, deriveConversationEffort, sanitizeEffort } from "./effortSelection.js";

const makeItem = (
    id: string,
    role: IChatConversationLocalItem["role"],
    reasoningEffort?: GenAIChatEffort,
): IChatConversationLocalItem => ({
    id,
    type: "item",
    localId: `local-${id || "optimistic"}`,
    responseId: "",
    createdAt: 1,
    complete: true,
    role,
    reasoningEffort,
    content: { type: "text", text: "hello" },
});

describe("sanitizeEffort", () => {
    it("keeps an effort the UI can render", () => {
        expect(sanitizeEffort("LOW")).toBe("LOW");
        expect(sanitizeEffort("MEDIUM")).toBe("MEDIUM");
    });

    it("drops an effort the UI has no option for, so the selection cannot end up unlabelled", () => {
        expect(sanitizeEffort("HIGH")).toBeUndefined();
        expect(sanitizeEffort(undefined)).toBeUndefined();
    });
});

describe("deriveConversationEffort", () => {
    it("returns nothing for a conversation with no history", () => {
        expect(deriveConversationEffort([])).toBeUndefined();
        expect(deriveConversationEffort(undefined)).toBeUndefined();
    });

    it("returns the effort of the last user message", () => {
        const items = [
            makeItem("1", "user", "MEDIUM"),
            makeItem("2", "assistant"),
            makeItem("3", "user", "LOW"),
            makeItem("4", "assistant"),
        ];

        expect(deriveConversationEffort(items)).toBe("LOW");
    });

    it("resolves a stored message with no effort to the default, rather than an older message's", () => {
        const items = [makeItem("1", "user", "LOW"), makeItem("2", "assistant"), makeItem("3", "user")];

        expect(deriveConversationEffort(items)).toBe(DEFAULT_EFFORT);
    });

    it("resolves an effort with no UI option to the default", () => {
        expect(deriveConversationEffort([makeItem("1", "user", "HIGH")])).toBe(DEFAULT_EFFORT);
    });

    it("ignores optimistic messages that have no server id yet", () => {
        const items = [makeItem("1", "user", "LOW"), makeItem("", "user")];

        expect(deriveConversationEffort(items)).toBe("LOW");
    });

    it("ignores non-user messages, which never carry an effort", () => {
        const items = [makeItem("1", "user", "LOW"), makeItem("2", "assistant"), makeItem("3", "system")];

        expect(deriveConversationEffort(items)).toBe("LOW");
    });
});
