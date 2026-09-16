// (C) 2026 GoodData Corporation

import { DefaultUiMenuGroupItem } from "@gooddata/sdk-ui-kit";

import { type IGenAIAssistantConversationDateGroupingProps } from "./types.js";

/**
 * Default implementation of the ConversationDateGrouping slot.
 *
 * @alpha
 */
export function DefaultConversationDateGrouping(props: IGenAIAssistantConversationDateGroupingProps) {
    return <DefaultUiMenuGroupItem {...props.menuGroupItemProps} />;
}
