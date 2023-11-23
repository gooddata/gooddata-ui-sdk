// (C) 2023 GoodData Corporation
import React from "react";
import { ConfirmDialog, LoadingMask } from "@gooddata/sdk-ui-kit";
import { FormattedMessage, useIntl } from "react-intl";
import { messages } from "@gooddata/sdk-ui";

import { useAttributeHierarchyDialog } from "./AttributeHierarchyDialogProvider.js";

const DeleteAttributeHierarchyConfirmation: React.FC = () => {
    const { formatMessage } = useIntl();
    const { isLoading, setLoading, setDisplayDeleteConfirmation, onDeleteAttributeHierarchy } =
        useAttributeHierarchyDialog();

    const handleClose = () => {
        setLoading(false);
        setDisplayDeleteConfirmation(false);
    };

    const cancelText = formatMessage(messages.hierarchyCancelButton);
    const deleteText = formatMessage(messages.hierarchyDeleteButton);
    const headlineText = formatMessage(messages.hierarchyDeleteConfirmTitle);

    return (
        <ConfirmDialog
            className="attribute-hierarchy-delete-confirmation s-attribute-hierarchy-delete-confirmation"
            cancelButtonText={cancelText}
            submitButtonText={deleteText}
            isCancelDisabled={isLoading}
            isSubmitDisabled={isLoading}
            headline={headlineText}
            displayCloseButton={true}
            onCancel={handleClose}
            onSubmit={onDeleteAttributeHierarchy}
        >
            <FormattedMessage id={messages.hierarchyDeleteConfirmMessage.id} tagName="div" />
            {isLoading ? (
                <LoadingMask className="attribute-hierarchy-content-loading-mask s-attribute-hierarchy-content-loading-mask" />
            ) : null}
        </ConfirmDialog>
    );
};

export default DeleteAttributeHierarchyConfirmation;
