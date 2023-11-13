// (C) 2023 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";

import { userManagementMessages } from "../../locales.js";

import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";
import { useDeleteUser } from "./dialogHooks.js";

/**
 * @internal
 */
export interface IDeleteUserDialogProps {
    userId: string;
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

/**
 * @internal
 */
export const DeleteUserDialog: React.FC<IDeleteUserDialogProps> = ({
    userId,
    organizationId,
    onSuccess,
    onClose,
}) => {
    const intl = useIntl();
    const deleteUser = useDeleteUser(userId, organizationId, onSuccess, onClose);
    return (
        <DeleteConfirmDialog
            titleText={intl.formatMessage(userManagementMessages.deleteUserConfirmTitle)}
            bodyText={intl.formatMessage(userManagementMessages.deleteUserConfirmBody)}
            onConfirm={deleteUser}
            onCancel={onClose}
        />
    );
};
