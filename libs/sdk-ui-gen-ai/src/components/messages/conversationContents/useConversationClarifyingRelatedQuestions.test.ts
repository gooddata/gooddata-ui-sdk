// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { makeAssistantItem, makeUserItem } from "../../../model.js";
import { type IChatMessagesGroup } from "../../utils/groupUtility.js";

import { useConversationClarifyingRelatedQuestions } from "./useConversationClarifyingRelatedQuestions.js";

describe("useConversationClarifyingRelatedQuestions", () => {
    const questions = [
        {
            text: "Which region?",
            control: {
                options: [{ text: "East" }, { text: "West" }],
            },
        },
    ];
    const questionsMessage = makeAssistantItem(
        {
            type: "multipart",
            parts: [{ type: "clarifyingQuestions", questions }],
        },
        "questions-item-id",
    );
    const groups: IChatMessagesGroup[] = [
        {
            type: "assistant",
            messages: [
                makeAssistantItem({ type: "text", text: "Unrelated message" }, "unrelated-item-id"),
                questionsMessage,
            ],
        },
    ];

    it("returns questions related to the clarifying answers message", () => {
        const answersMessage = makeUserItem({
            type: "clarifyingAnswers",
            questionsItemId: questionsMessage.id,
            answers: [],
        });

        const { result } = renderHook(() =>
            useConversationClarifyingRelatedQuestions(groups, answersMessage),
        );

        expect(result.current).toEqual(questions);
    });

    it("returns no questions when the related message is not found", () => {
        const answersMessage = makeUserItem({
            type: "clarifyingAnswers",
            questionsItemId: "missing-item-id",
            answers: [],
        });

        const { result } = renderHook(() =>
            useConversationClarifyingRelatedQuestions(groups, answersMessage),
        );

        expect(result.current).toEqual([]);
    });

    it("returns no questions for a message without clarifying answers", () => {
        const message = makeUserItem({ type: "text", text: "Hello" });

        const { result } = renderHook(() => useConversationClarifyingRelatedQuestions(groups, message));

        expect(result.current).toEqual([]);
    });
});
