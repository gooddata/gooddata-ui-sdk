// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

import { type IChatConversationLocal } from "../model.js";
import { catalogItemsSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { generateTemporaryTitle } from "../utils.js";

import { collectReferences, replaceReferences } from "./completion/references.js";

const messages = defineMessages({
    title: { id: "gd.gen-ai.conversations.delete-dialog.title" },
    body: { id: "gd.gen-ai.conversations.delete-dialog.body" },
    submit: { id: "gd.gen-ai.conversations.delete-dialog.submit" },
    cancel: { id: "gd.gen-ai.conversations.delete-dialog.cancel" },
});

type ConversationDeleteDialogProps = {
    conversation: IChatConversationLocal;
    onDelete: () => void;
    onClose: () => void;
};

export function ConversationDeleteDialog({ conversation, onDelete, onClose }: ConversationDeleteDialogProps) {
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
            headline={intl.formatMessage(messages.title)}
            cancelButtonText={intl.formatMessage(messages.cancel)}
            submitButtonText={intl.formatMessage(messages.submit)}
            isPositive={false}
            onCancel={onClose}
            onClose={onClose}
            onSubmit={onDelete}
        >
            <FormattedMessage
                {...messages.body}
                values={{
                    name: title,
                    b: (chunks) => <b>{chunks}</b>,
                }}
            />
        </ConfirmDialog>
    );
}
