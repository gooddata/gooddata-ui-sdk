// (C) 2026 GoodData Corporation

import { ConversationDeleteDialog } from "../ConversationDeleteDialog.js";

import type { IGenAIAssistantConversationDeleteDialogProps } from "./types.js";

/**
 * Default implementation of the ConversationDeleteDialog slot.
 *
 * @alpha
 */
export function DefaultConversationDeleteDialog(props: IGenAIAssistantConversationDeleteDialogProps) {
    return <ConversationDeleteDialog {...props} />;
}
