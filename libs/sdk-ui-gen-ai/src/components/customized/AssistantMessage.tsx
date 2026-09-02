// (C) 2024-2026 GoodData Corporation

import { AssistantItemComponent } from "../messages/AssistantItem.js";

import { type IGenAIAssistantAssistantMessageProps } from "./types.js";

/**
 * Default implementation of the AssistantMessage slot.
 *
 * @alpha
 */
export function DefaultAssistantMessage(props: IGenAIAssistantAssistantMessageProps) {
    return <AssistantItemComponent {...props} />;
}
