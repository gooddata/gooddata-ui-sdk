// (C) 2024-2026 GoodData Corporation

import { AssistantItemFeedback } from "../messages/AssistantItemFeedback.js";

import type { IGenAIAssistantFeedbackProps } from "./types.js";

/**
 * Default implementation of the Feedback slot.
 *
 * @alpha
 */
export function DefaultFeedback(props: IGenAIAssistantFeedbackProps) {
    return <AssistantItemFeedback {...props} />;
}
