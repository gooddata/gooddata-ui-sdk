// (C) 2023 GoodData Corporation

import React from "react";
import { useIntl } from "react-intl";

import { messages } from "./locales.js";
import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";
import { useDeleteUserGroup } from "./dialogHooks.js";
import { IWithTelemetryProps, withTelemetry } from "./TelemetryContext.js";

/**
 * @internal
 */
export interface IDeleteUserGroupDialogProps extends IWithTelemetryProps {
    userGroupId: string;
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

const DeleteUserGroupDialogComponent: React.FC<IDeleteUserGroupDialogProps> = ({
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

/**
 * @internal
 */
export const DeleteUserGroupDialog = withTelemetry(DeleteUserGroupDialogComponent);
