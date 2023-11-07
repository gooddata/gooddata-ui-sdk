// (C) 2023 GoodData Corporation

import React, { ReactNode } from "react";
import { useIntl } from "react-intl";
import { useBackendStrict } from "@gooddata/sdk-ui";

import { userManagementMessages } from "../../locales.js";
import { useToastMessage } from "../../Messages/index.js";

import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";

/**
 * @alpha
 */
export interface IDeleteUserGroupsDialogProps {
    userGroupIds: string[];
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

/**
 * @alpha
 */
export const DeleteUserGroupsDialog: React.FC<IDeleteUserGroupsDialogProps> = ({
    userGroupIds,
    organizationId,
    onSuccess,
    onClose,
}) => {
    const intl = useIntl();
    const backend = useBackendStrict();
    const { addSuccess, addError } = useToastMessage();

    const onConfirm = () =>
        backend
            .organization(organizationId)
            .users()
            .deleteUserGroups(userGroupIds)
            .then(() => {
                addSuccess(userManagementMessages.userGroupsDeleteSuccess);
                onSuccess();
                onClose();
            })
            .catch((error) => {
                console.error("Delete of user groups failed", error);
                addError(userManagementMessages.userGroupsDeleteFailure);
            });

    return (
        <DeleteConfirmDialog
            titleText={intl.formatMessage(userManagementMessages.deleteUserGroupsConfirmTitle)}
            bodyText={intl.formatMessage(userManagementMessages.deleteUserGroupsConfirmBody, {
                b: (chunks: ReactNode) => <b>{chunks}</b>,
                br: <br />,
                count: userGroupIds.length,
            })}
            onConfirm={onConfirm}
            onCancel={onClose}
        />
    );
};
