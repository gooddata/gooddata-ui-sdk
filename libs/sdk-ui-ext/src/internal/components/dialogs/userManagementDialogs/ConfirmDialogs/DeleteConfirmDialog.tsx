// (C) 2023-2025 GoodData Corporation

import { ReactNode } from "react";

import { useIntl } from "react-intl";

import { ConfirmDialog, Typography } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";

export interface IDeleteConfirmDialogProps {
    titleText: string;
    bodyText: string | ReactNode;
    isProcessing: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteConfirmDialog({
    titleText,
    bodyText,
    isProcessing,
    onConfirm,
    onCancel,
}: IDeleteConfirmDialogProps) {
    const intl = useIntl();
    return (
        <ConfirmDialog
            onSubmit={onConfirm}
            onCancel={onCancel}
            isPositive={false}
            isSubmitDisabled={isProcessing}
            showProgressIndicator={isProcessing}
            className="gd-user-management-delete-dialog s-user-management-delete-confirm-dialog"
            headline={titleText}
            submitButtonText={intl.formatMessage(messages.confirmDeleteButton)}
            cancelButtonText={intl.formatMessage(messages.cancelDeleteButton)}
        >
            <Typography tagName="p">{bodyText}</Typography>
        </ConfirmDialog>
    );
}
