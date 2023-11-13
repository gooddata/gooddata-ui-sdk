// (C) 2023 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";
import { ConfirmDialog, Typography } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";

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
            className="gd-user-management-delete-dialog s-user-management-delete-confirm-dialog"
            headline={titleText}
            submitButtonText={intl.formatMessage(messages.confirmDeleteButton)}
            cancelButtonText={intl.formatMessage(messages.cancelDeleteButton)}
        >
            <Typography tagName="p">{bodyText}</Typography>
        </ConfirmDialog>
    );
};
