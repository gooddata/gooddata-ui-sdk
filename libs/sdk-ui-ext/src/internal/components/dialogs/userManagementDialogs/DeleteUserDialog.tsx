// (C) 2023 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";

import { messages } from "./locales.js";
import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";
import { useDeleteUser } from "./dialogHooks.js";
import { IWithTelemetryProps, withTelemetry } from "./TelemetryContext.js";

/**
 * @internal
 */
export interface IDeleteUserDialogProps extends IWithTelemetryProps {
    userId: string;
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

const DeleteUserDialogComponent: React.FC<IDeleteUserDialogProps> = ({
    userId,
    organizationId,
    onSuccess,
    onClose,
}) => {
    const intl = useIntl();
    const { deleteUser, isDeleteUserProcessing } = useDeleteUser(userId, organizationId, onSuccess, onClose);
    return (
        <DeleteConfirmDialog
            titleText={intl.formatMessage(messages.deleteUserConfirmTitle)}
            bodyText={intl.formatMessage(messages.deleteUserConfirmBody)}
            isProcessing={isDeleteUserProcessing}
            onConfirm={deleteUser}
            onCancel={onClose}
        />
    );
};

/**
 * @internal
 */
export const DeleteUserDialog = withTelemetry(DeleteUserDialogComponent);
