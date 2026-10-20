// (C) 2026 GoodData Corporation

import { type IChatConversationClarifyingQuestionsContent } from "@gooddata/sdk-backend-spi";
import { type IGenAiClarifyingQuestion } from "@gooddata/sdk-model";

import type { IChatConversationLocalItem } from "../../../model.js";
import type { IChatMessagesGroup } from "../../utils/groupUtility.js";

export function useConversationClarifyingRelatedQuestions(
    groups: IChatMessagesGroup[],
    message: IChatConversationLocalItem,
): IGenAiClarifyingQuestion[] {
    if (message.content.type !== "clarifyingAnswers") {
        return [];
    }

    const questionsItemId = message.content.questionsItemId;

    let found: IChatConversationClarifyingQuestionsContent | undefined;
    groups.forEach((group) => {
        group.messages.forEach((msg) => {
            const content = msg.content;
            if (content.type === "multipart") {
                content.parts.forEach((part) => {
                    if (part.type === "clarifyingQuestions" && msg.id === questionsItemId) {
                        found = part;
                    }
                });
            }
        });
    });

    if (!found) {
        return [];
    }
    return found.questions;
}
