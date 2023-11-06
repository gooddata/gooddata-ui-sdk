// (C) 2023 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";

import { userManagementMessages } from "../../locales.js";

import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";
import { useDeleteUser } from "./dialogHooks.js";

/**
 * @alpha
 */
export interface IDeleteUserDialogProps {
    userId: string;
    organizationId: string;
    onDeleteUser: () => void;
    onClose: () => void;
}

/**
 * @alpha
 */
export const DeleteUserDialog: React.FC<IDeleteUserDialogProps> = ({
    userId,
    organizationId,
    onDeleteUser,
    onClose,
}) => {
    const intl = useIntl();
    const deleteUser = useDeleteUser(userId, organizationId, onDeleteUser, onClose);
    return (
        <DeleteConfirmDialog
            titleText={intl.formatMessage(userManagementMessages.deleteUserConfirmTitle)}
            bodyText={intl.formatMessage(userManagementMessages.deleteUserConfirmBody, {
                br: <br />,
            })}
            onConfirm={deleteUser}
            onCancel={onClose}
        />
    );
};
