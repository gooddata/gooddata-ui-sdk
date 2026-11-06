// (C) 2026 GoodData Corporation

import { ConversationRenameDialog } from "../ConversationRenameDialog.js";

import type { IGenAIAssistantConversationRenameDialogProps } from "./types.js";

/**
 * Default implementation of the ConversationRenameDialog slot.
 *
 * @alpha
 */
export function DefaultConversationRenameDialog(props: IGenAIAssistantConversationRenameDialogProps) {
    return <ConversationRenameDialog {...props} />;
}
