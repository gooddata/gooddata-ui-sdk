// (C) 2025-2026 GoodData Corporation

import { DefaultUiMenuInteractiveItemWrapper } from "@gooddata/sdk-ui-kit";

import { type IGenAIAssistantAgentItemProps } from "./types.js";

/**
 * Default implementation of the AgentItem slot.
 *
 * @alpha
 */
export function DefaultAgentItem(props: IGenAIAssistantAgentItemProps) {
    const { menuItemProps, Content } = props;
    if (menuItemProps) {
        return <DefaultUiMenuInteractiveItemWrapper {...menuItemProps} Component={Content} />;
    }

    // Fallback if used outside the agent chooser dropdown
    return <li>{props.agent.title}</li>;
}
