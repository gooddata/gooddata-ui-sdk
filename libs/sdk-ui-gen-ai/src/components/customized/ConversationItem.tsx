// (C) 2026 GoodData Corporation

import { DefaultUiMenuInteractiveItemWrapper } from "@gooddata/sdk-ui-kit";

import { type IGenAIAssistantConversationItemProps } from "./types.js";

/**
 * Default implementation of the ConversationItem slot.
 *
 * @alpha
 */
export function DefaultConversationItem(props: IGenAIAssistantConversationItemProps) {
    return <DefaultUiMenuInteractiveItemWrapper {...props.menuItemProps} />;
}
