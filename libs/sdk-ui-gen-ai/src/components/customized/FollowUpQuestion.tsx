// (C) 2026 GoodData Corporation

import { AssistantItemFollowUpQuestion } from "../messages/AssistantItemFollowUpQuestion.js";

import type { IGenAIAssistantFollowUpQuestionProps } from "./types.js";

/**
 * Default implementation of the FollowUpQuestion slot.
 *
 * @alpha
 */
export function DefaultFollowUpQuestion(props: IGenAIAssistantFollowUpQuestionProps) {
    return <AssistantItemFollowUpQuestion {...props} />;
}
