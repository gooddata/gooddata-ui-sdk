// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IChatConversationItem } from "@gooddata/sdk-backend-spi";

import { convertToLocalConversationItems } from "./toLocalConversationItems.js";

const clarification: IChatConversationItem = {
    type: "item",
    id: "clarification",
    responseId: "response-1",
    role: "assistant",
    createdAt: 1,
    agentId: "agent",
    content: {
        type: "multipart",
        parts: [
            { type: "text", text: "Please clarify" },
            { type: "clarifyingQuestions", questions: [] },
            { type: "visualization", visualization: null, unsupportedChartType: "combo_chart" },
        ],
    },
};

const text: IChatConversationItem = {
    type: "item",
    id: "answer",
    responseId: "response-2",
    role: "user",
    createdAt: 2,
    content: { type: "text", text: "Use the first option" },
};

describe("convertToLocalConversationItems", () => {
    it("returns an empty list for empty history", () => {
        expect(convertToLocalConversationItems([])).toEqual([]);
    });

    it.each([
        { name: "only clarification", items: [clarification], filled: [false] },
        { name: "answered clarification", items: [clarification, text], filled: [true, true] },
        { name: "only text", items: [text], filled: [true] },
        {
            name: "consecutive clarifications",
            items: [clarification, { ...clarification, id: "next-clarification" }],
            filled: [true, false],
        },
    ])("sets completion flags for $name", ({ items, filled }) => {
        const result = convertToLocalConversationItems(items);

        expect(result.map((item) => item.filled)).toEqual(filled);
        expect(result.map((item) => item.complete)).toEqual(items.map(() => true));
    });

    it("preserves order and metadata, converts content, and creates fresh local IDs without mutating history", () => {
        const history = Object.freeze([clarification, text]);
        const original = structuredClone(history);

        const items = convertToLocalConversationItems(history);

        expect(items).toEqual([
            {
                ...clarification,
                localId: expect.any(String),
                complete: true,
                filled: true,
                content: {
                    type: "multipart",
                    parts: [
                        { type: "text", text: "Please clarify" },
                        { type: "clarifyingQuestions", questions: [] },
                        {
                            type: "visualization",
                            visualization: null,
                            unsupportedChartType: "combo_chart",
                            reporting: true,
                        },
                    ],
                },
            },
            { ...text, localId: expect.any(String), complete: true, filled: true },
        ]);
        const localIds = items.map((item) => item.localId);
        expect(localIds.every((id) => id.length > 0)).toBe(true);
        expect(new Set(localIds).size).toBe(history.length);
        expect(convertToLocalConversationItems(history).map((item) => item.localId)).not.toEqual(localIds);
        expect(history).toEqual(original);
        expect(items[0]).not.toBe(history[0]);
        expect(items[0].content).not.toBe(history[0].content);
    });
});
