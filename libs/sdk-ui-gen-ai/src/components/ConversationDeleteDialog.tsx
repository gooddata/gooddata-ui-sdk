// (C) 2026 GoodData Corporation

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { type IChatConversation } from "@gooddata/sdk-backend-spi";
import { ConfirmDialog } from "@gooddata/sdk-ui-kit";

const messages = defineMessages({
    title: { id: "gd.gen-ai.conversations.delete-dialog.title" },
    body: { id: "gd.gen-ai.conversations.delete-dialog.body" },
    submit: { id: "gd.gen-ai.conversations.delete-dialog.submit" },
    cancel: { id: "gd.gen-ai.conversations.delete-dialog.cancel" },
});

type ConversationDeleteDialogProps = {
    conversation: IChatConversation;
    onDelete: () => void;
    onClose: () => void;
};

export function ConversationDeleteDialog({ conversation, onDelete, onClose }: ConversationDeleteDialogProps) {
    const intl = useIntl();

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
                    name: conversation.title ?? conversation.id,
                    b: (chunks) => <b>{chunks}</b>,
                }}
            />
        </ConfirmDialog>
    );
}
