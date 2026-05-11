// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { ConfirmDialog, useToastMessage } from "@gooddata/sdk-ui-kit";

import { type ICatalogItemParameter } from "../catalogItem/types.js";

import { useParameterMutation } from "./ParameterMutationContext.js";

const messages = defineMessages({
    title: { id: "analyticsCatalog.parameter.dialog.delete.title" },
    body: { id: "analyticsCatalog.parameter.dialog.delete.body" },
    submit: { id: "analyticsCatalog.parameter.dialog.delete.submit" },
    cancel: { id: "analyticsCatalog.parameter.dialog.cancel" },
    deleteSuccess: { id: "analyticsCatalog.parameter.delete.success" },
    deleteError: { id: "analyticsCatalog.parameter.delete.error" },
});

type Props = {
    item: ICatalogItemParameter;
    onClose: () => void;
    onDeleted: () => void;
};

export function ParameterDeleteDialog({ item, onClose, onDeleted }: Props) {
    const intl = useIntl();
    const { addSuccess, addError } = useToastMessage();
    const mutation = useParameterMutation();
    const [isDeleting, setIsDeleting] = useState(false);

    const displayName = item.title || item.identifier;

    const handleDelete = useCallback(async () => {
        setIsDeleting(true);
        try {
            await mutation.delete(item);
            onDeleted();
            onClose();
            addSuccess(messages.deleteSuccess);
        } catch {
            addError(messages.deleteError);
            setIsDeleting(false);
        }
    }, [addError, addSuccess, item, mutation, onClose, onDeleted]);

    return (
        <ConfirmDialog
            headline={intl.formatMessage(messages.title)}
            cancelButtonText={intl.formatMessage(messages.cancel)}
            submitButtonText={intl.formatMessage(messages.submit)}
            isPositive={false}
            isSubmitDisabled={isDeleting}
            isCancelDisabled={isDeleting}
            showProgressIndicator={isDeleting}
            onCancel={onClose}
            onClose={onClose}
            onSubmit={handleDelete}
            displayCloseButton={!isDeleting}
        >
            <FormattedMessage
                {...messages.body}
                values={{
                    name: displayName,
                    b: (chunks) => <b>{chunks}</b>,
                }}
            />
        </ConfirmDialog>
    );
}
