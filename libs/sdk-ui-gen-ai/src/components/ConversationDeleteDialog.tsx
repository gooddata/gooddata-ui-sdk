// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

import { catalogItemsSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { generateTemporaryTitle } from "../utils.js";

import { collectReferences, replaceReferences } from "./completion/references.js";
import type { IGenAIAssistantConversationDeleteDialogProps } from "./customized/types.js";

const messages = defineMessages({
    title: { id: "gd.gen-ai.conversations.delete-dialog.title" },
    body: { id: "gd.gen-ai.conversations.delete-dialog.body" },
    submit: { id: "gd.gen-ai.conversations.delete-dialog.submit" },
    cancel: { id: "gd.gen-ai.conversations.delete-dialog.cancel" },
});

export type ConversationDeleteDialogProps = IGenAIAssistantConversationDeleteDialogProps;

export function ConversationDeleteDialog({
    conversation,
    onDelete,
    onClose,
    title: customTitle,
    body,
    submitButtonText,
    cancelButtonText,
}: ConversationDeleteDialogProps) {
    const intl = useIntl();
    const catalogItems = useSelector(catalogItemsSelector);

    const title = useMemo(() => {
        return (
            replaceReferences(
                conversation.title ?? "",
                collectReferences(conversation.title ?? "", catalogItems),
            ) || generateTemporaryTitle(intl, conversation)
        );
    }, [catalogItems, conversation, intl]);

    return (
        <ConfirmDialog
            headline={customTitle ?? intl.formatMessage(messages.title)}
            cancelButtonText={cancelButtonText ?? intl.formatMessage(messages.cancel)}
            submitButtonText={submitButtonText ?? intl.formatMessage(messages.submit)}
            isPositive={false}
            onCancel={onClose}
            onClose={onClose}
            onSubmit={onDelete}
        >
            {body?.({ name: title }) ?? (
                <FormattedMessage
                    {...messages.body}
                    values={{
                        name: title,
                        b: (chunks) => <b>{chunks}</b>,
                    }}
                />
            )}
        </ConfirmDialog>
    );
}
