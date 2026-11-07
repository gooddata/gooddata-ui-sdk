// (C) 2026 GoodData Corporation

import { useMemo, useState } from "react";

import { defineMessages, useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { ConfirmDialog, Input } from "@gooddata/sdk-ui-kit";

import { catalogItemsSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { generateTemporaryTitle } from "../utils.js";

import { collectReferences, replaceReferences } from "./completion/references.js";
import type { IGenAIAssistantConversationRenameDialogProps } from "./customized/types.js";

const messages = defineMessages({
    title: { id: "gd.gen-ai.conversations.rename-dialog.title" },
    label: { id: "gd.gen-ai.conversations.rename-dialog.label" },
    submit: { id: "gd.gen-ai.conversations.rename-dialog.submit" },
    cancel: { id: "gd.gen-ai.conversations.rename-dialog.cancel" },
});

export type ConversationRenameDialogProps = IGenAIAssistantConversationRenameDialogProps;

export function ConversationRenameDialog({
    conversation,
    onRename,
    onClose,
    title,
    label,
    submitButtonText,
    cancelButtonText,
}: ConversationRenameDialogProps) {
    const intl = useIntl();
    const catalogItems = useSelector(catalogItemsSelector);

    const currentTitle = useMemo(() => {
        return (
            replaceReferences(
                conversation.title ?? "",
                collectReferences(conversation.title ?? "", catalogItems),
            ) || generateTemporaryTitle(intl, conversation)
        );
    }, [catalogItems, conversation, intl]);

    const [value, setValue] = useState(currentTitle);

    return (
        <ConfirmDialog
            headline={title ?? intl.formatMessage(messages.title)}
            cancelButtonText={cancelButtonText ?? intl.formatMessage(messages.cancel)}
            submitButtonText={submitButtonText ?? intl.formatMessage(messages.submit)}
            isPositive
            autofocusOnOpen={false}
            submitOnEnterKey
            isSubmitDisabled={!value.trim()}
            onCancel={onClose}
            onClose={onClose}
            onSubmit={() => onRename(value.trim())}
            className="gd-gen-ai-chat__rename-dialog"
        >
            <Input
                autofocus
                label={label ?? intl.formatMessage(messages.label)}
                className="gd-gen-ai-chat__rename-dialog__input"
                labelPositionTop
                value={value}
                onChange={(newValue) => setValue(String(newValue))}
            />
        </ConfirmDialog>
    );
}
