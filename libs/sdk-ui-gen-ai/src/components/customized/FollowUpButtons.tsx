// (C) 2026 GoodData Corporation

import { AssistantItemFollowUpButtons } from "../messages/AssistantItemFollowUpButtons.js";

import type { IGenAIAssistantFollowUpButtonsProps } from "./types.js";

/**
 * Default implementation of the FollowUpButtons slot.
 *
 * @alpha
 */
export function DefaultFollowUpButtons(props: IGenAIAssistantFollowUpButtonsProps) {
    return <AssistantItemFollowUpButtons {...props} />;
}
