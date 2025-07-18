// (C) 2023-2025 GoodData Corporation

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

function DeleteUserGroupDialogComponent({
    userGroupId,
    organizationId,
    onSuccess,
    onClose,
}: IDeleteUserGroupDialogProps) {
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
}

/**
 * @internal
 */
export const DeleteUserGroupDialog = withTelemetry(DeleteUserGroupDialogComponent);
