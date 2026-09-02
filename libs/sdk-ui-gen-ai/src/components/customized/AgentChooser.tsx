// (C) 2026 GoodData Corporation

import { GenAIChatAgentDropdown } from "../GenAIChatAgentDropdown.js";

import type { IGenAIAssistantAgentChooserProps } from "./types.js";

/**
 * Default implementation of the AgentChooser slot.
 *
 * @alpha
 */
export function DefaultAgentChooser(props: IGenAIAssistantAgentChooserProps) {
    return <GenAIChatAgentDropdown {...props} />;
}
