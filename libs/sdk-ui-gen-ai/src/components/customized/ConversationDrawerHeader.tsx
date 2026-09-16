// (C) 2026 GoodData Corporation

import { type IGenAIAssistantConversationDrawerHeaderProps } from "./types.js";

/**
 * Default implementation of the ConversationDrawerHeader slot.
 *
 * @alpha
 */
export function DefaultConversationDrawerHeader(props: IGenAIAssistantConversationDrawerHeaderProps) {
    return (
        <div style={{ width: "100%" }}>
            <div className="gd-gen-ai-chat__window__conversations__header">{props.title}</div>
            <div className="gd-gen-ai-chat__window__conversations__divider" />
        </div>
    );
}
