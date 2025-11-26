// (C) 2024-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type AssistantMessage } from "../../../model.js";
import { getAssistantMessageState } from "../messageState.js";

const baseMessage: AssistantMessage = {
    id: "server-id",
    localId: "local-id",
    role: "assistant",
    created: 0,
    cancelled: false,
    feedback: "NONE",
    complete: false,
    content: [],
};

describe("getAssistantMessageState", () => {
    it("returns cancelled when message is cancelled", () => {
        const message: AssistantMessage = { ...baseMessage, cancelled: true, content: [] };

        expect(getAssistantMessageState(message)).toBe("cancelled");
    });

    it("returns error when any content is error", () => {
        const message: AssistantMessage = {
            ...baseMessage,
            content: [{ type: "error", text: "boom" }],
        };

        expect(getAssistantMessageState(message)).toBe("error");
    });

    it("returns loading while incomplete with no rendered content", () => {
        const message: AssistantMessage = { ...baseMessage, content: [] };

        expect(getAssistantMessageState(message)).toBe("loading");
    });

    it("returns streaming once content is rendered but completion flag is false", () => {
        const message: AssistantMessage = {
            ...baseMessage,
            content: [{ type: "text", text: "partial response", objects: [] }],
        };

        expect(getAssistantMessageState(message)).toBe("streaming");
    });

    it("returns complete once backend marks it complete", () => {
        const message: AssistantMessage = { ...baseMessage, complete: true, content: [] };

        expect(getAssistantMessageState(message)).toBe("complete");
    });
});
