// (C) 2023 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";

import { userManagementMessages } from "../../locales.js";

import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";
import { useDeleteUserGroup } from "./dialogHooks.js";

/**
 * @internal
 */
export interface IDeleteUserGroupDialogProps {
    userGroupId: string;
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

/**
 * @internal
 */
export const DeleteUserGroupDialog: React.FC<IDeleteUserGroupDialogProps> = ({
    userGroupId,
    organizationId,
    onSuccess,
    onClose,
}) => {
    const intl = useIntl();
    const deleteUserGroup = useDeleteUserGroup(userGroupId, organizationId, onSuccess, onClose);
    return (
        <DeleteConfirmDialog
            titleText={intl.formatMessage(userManagementMessages.deleteUserGroupConfirmTitle)}
            bodyText={intl.formatMessage(userManagementMessages.deleteUserGroupConfirmBody, {
                br: <br />,
            })}
            onConfirm={deleteUserGroup}
            onCancel={onClose}
        />
    );
};
