// (C) 2023 GoodData Corporation

import React from "react";
import { ConfirmDialog } from "../../ConfirmDialog.js";
import { Typography } from "../../../Typography/index.js";
import { useIntl } from "react-intl";
import { userManagementMessages } from "../../../locales.js";

export interface IDeleteConfirmDialogProps {
    titleText: string;
    bodyText: string | React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<IDeleteConfirmDialogProps> = ({
    titleText,
    bodyText,
    onConfirm,
    onCancel,
}) => {
    const intl = useIntl();
    return (
        <ConfirmDialog
            onSubmit={onConfirm}
            onCancel={onCancel}
            isPositive={false}
            className="s-user-management-delete-confirm-dialog"
            headline={titleText}
            submitButtonText={intl.formatMessage(userManagementMessages.confirmDeleteButton)}
            cancelButtonText={intl.formatMessage(userManagementMessages.cancelDeleteButton)}
        >
            <Typography tagName="p">{bodyText}</Typography>
        </ConfirmDialog>
    );
};
