// (C) 2024-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IChatConversationLocalItem } from "../../../model.js";
import { groupMessages } from "../groupUtility.js";

describe("groupMessages", () => {
    const createUserMessage = (text: string): IChatConversationLocalItem => ({
        id: "u1",
        type: "item",
        localId: "u1-local",
        responseId: "r1",
        createdAt: 1000,
        role: "user",
        content: { type: "text", text },
    });

    const createAssistantMessage = (text: string): IChatConversationLocalItem => ({
        id: "a1",
        type: "item",
        localId: "a1-local",
        responseId: "r1",
        createdAt: 1001,
        role: "assistant",
        content: { type: "text", text },
    });

    const createReasoningMessage = (summary: string): IChatConversationLocalItem => ({
        id: "re1",
        type: "item",
        localId: "re1-local",
        responseId: "r1",
        createdAt: 1002,
        role: "assistant",
        content: { type: "reasoning", summary },
    });

    const createErrorMessage = (message: string): IChatConversationLocalItem => ({
        id: "e1",
        type: "item",
        localId: "e1-local",
        responseId: "r1",
        createdAt: 1003,
        role: "assistant",
        content: { type: "error", message },
    });

    const createToolCallMessage = (): IChatConversationLocalItem => ({
        id: "tc1",
        type: "item",
        localId: "tc1-local",
        responseId: "r1",
        createdAt: 1004,
        role: "assistant",
        content: {
            type: "toolCall",
            toolCall: { id: "tc1", type: "function", function: { name: "test", arguments: "{}" } },
        } as any,
    });

    const createToolResultMessage = (): IChatConversationLocalItem => ({
        id: "tr1",
        type: "item",
        localId: "tr1-local",
        responseId: "r1",
        createdAt: 1005,
        role: "tool",
        content: { type: "toolResult", toolCallId: "tc1", result: "{}" } as any,
    });

    it("should return empty array for empty messages", () => {
        expect(groupMessages([])).toEqual([]);
    });

    it("should group consecutive user messages", () => {
        const messages = [createUserMessage("hello"), createUserMessage("world")];
        const result = groupMessages(messages);
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("user");
        expect(result[0].messages).toHaveLength(2);
    });

    it("should group consecutive assistant and tool messages", () => {
        const messages = [
            createAssistantMessage("think"),
            createToolCallMessage(),
            createToolResultMessage(),
            createAssistantMessage("done"),
        ];
        const result = groupMessages(messages);
        expect(result).toHaveLength(3);
        expect(result[0].type).toBe("assistant");
        expect(result[0].messages).toHaveLength(1);
        expect(result[1].type).toBe("reasoning");
        expect(result[1].messages).toHaveLength(2);
        expect(result[2].type).toBe("assistant");
        expect(result[2].messages).toHaveLength(1);
    });

    it("should group consecutive reasoning messages", () => {
        const messages = [createReasoningMessage("step 1"), createReasoningMessage("step 2")];
        const result = groupMessages(messages);
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("reasoning");
        expect(result[0].messages).toHaveLength(2);
    });

    it("should group consecutive error messages", () => {
        const messages = [createErrorMessage("err 1"), createErrorMessage("err 2")];
        const result = groupMessages(messages);
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("error");
        expect(result[0].messages).toHaveLength(2);
    });

    it("should include error message in reasoning group if between reasoning messages", () => {
        const messages = [
            createReasoningMessage("step 1"),
            createErrorMessage("oops"),
            createReasoningMessage("step 2"),
        ];
        const result = groupMessages(messages);
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("reasoning");
        expect(result[0].messages).toHaveLength(3);
    });

    it("should NOT include error message in reasoning group if at the beginning", () => {
        const messages = [createErrorMessage("oops"), createReasoningMessage("step 1")];
        const result = groupMessages(messages);
        expect(result).toHaveLength(2);
        expect(result[0].type).toBe("error");
        expect(result[1].type).toBe("reasoning");
    });

    it("should NOT include error message in reasoning group if at the end", () => {
        const messages = [createReasoningMessage("step 1"), createErrorMessage("oops")];
        const result = groupMessages(messages);
        expect(result).toHaveLength(2);
        expect(result[0].type).toBe("reasoning");
        expect(result[1].type).toBe("error");
    });

    it("should handle complex reasoning/error sequence correctly", () => {
        const messages = [
            createReasoningMessage("r1"),
            createErrorMessage("e1"),
            createReasoningMessage("r2"),
            createErrorMessage("e2"),
            createReasoningMessage("r3"),
            createErrorMessage("e3"),
        ];
        const result = groupMessages(messages);
        expect(result).toHaveLength(2);
        expect(result[0].type).toBe("reasoning");
        expect(result[0].messages).toHaveLength(5);
        expect(result[1].type).toBe("error");
        expect(result[1].messages).toHaveLength(1);
        expect(result[1].messages[0].content.type).toBe("error");
    });

    it("should handle error group between reasoning groups", () => {
        const messages = [
            createReasoningMessage("r1"),
            createErrorMessage("e1"),
            createErrorMessage("e2"),
            createReasoningMessage("r2"),
        ];
        const result = groupMessages(messages);
        expect(result).toHaveLength(1);
        expect(result[0].type).toBe("reasoning");
        expect(result[0].messages).toHaveLength(4);
    });
});
