// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import { ConfirmDialog, useToastMessage } from "@gooddata/sdk-ui-kit";

import { useCatalogFeedActions } from "../catalogItem/CatalogFeedContext.js";
import { deleteParameterCatalogItem } from "../catalogItem/query.js";
import { type ICatalogItemParameter } from "../catalogItem/types.js";

const messages = defineMessages({
    title: { id: "analyticsCatalog.parameter.dialog.delete.title" },
    body: { id: "analyticsCatalog.parameter.dialog.delete.body" },
    submit: { id: "analyticsCatalog.parameter.dialog.delete.submit" },
    cancel: { id: "analyticsCatalog.parameter.dialog.cancel" },
    deleteSuccess: { id: "analyticsCatalog.parameter.delete.success" },
    deleteError: { id: "analyticsCatalog.parameter.delete.error" },
});

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
    item: ICatalogItemParameter;
    onClose: () => void;
    onDeleted: () => void;
};

export function ParameterDeleteDialog({ backend, workspace, item, onClose, onDeleted }: Props) {
    const intl = useIntl();
    const { addSuccess, addError } = useToastMessage();
    const { refetchObjectType } = useCatalogFeedActions();
    const [isDeleting, setIsDeleting] = useState(false);

    const displayName = item.title || item.identifier;

    const handleDelete = useCallback(async () => {
        setIsDeleting(true);
        try {
            await deleteParameterCatalogItem(backend, workspace, idRef(item.identifier, "parameter"));
            onDeleted();
            onClose();
            addSuccess(messages.deleteSuccess);
            await refetchObjectType("parameter");
        } catch {
            addError(messages.deleteError);
            setIsDeleting(false);
        }
    }, [addError, addSuccess, backend, item.identifier, onClose, onDeleted, refetchObjectType, workspace]);

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
