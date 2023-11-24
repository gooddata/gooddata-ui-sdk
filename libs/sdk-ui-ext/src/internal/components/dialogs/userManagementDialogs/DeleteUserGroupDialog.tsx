// (C) 2023 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";

import { messages } from "./locales.js";
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
    const { deleteUserGroup, isDeleteUserGroupProcessing } = useDeleteUserGroup(
        userGroupId,
        organizationId,
        onSuccess,
        onClose,
    );
    return (
        <DeleteConfirmDialog
            titleText={intl.formatMessage(messages.deleteUserGroupConfirmTitle)}
            bodyText={intl.formatMessage(messages.deleteUserGroupConfirmBody)}
            isProcessing={isDeleteUserGroupProcessing}
            onConfirm={deleteUserGroup}
            onCancel={onClose}
        />
    );
};
