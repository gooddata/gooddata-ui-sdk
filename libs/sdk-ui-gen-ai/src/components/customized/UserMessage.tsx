// (C) 2024-2026 GoodData Corporation

import { UserItemComponent } from "../messages/UserItem.js";

import { type IGenAIAssistantUserMessageProps } from "./types.js";

/**
 * Default implementation of the UserMessage slot.
 *
 * @alpha
 */
export function DefaultUserMessage(props: IGenAIAssistantUserMessageProps) {
    return <UserItemComponent {...props} />;
}
