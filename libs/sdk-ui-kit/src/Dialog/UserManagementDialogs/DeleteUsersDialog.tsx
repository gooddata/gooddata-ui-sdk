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
export interface IDeleteUsersDialogProps {
    userIds: string[];
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

/**
 * @alpha
 */
export const DeleteUsersDialog: React.FC<IDeleteUsersDialogProps> = ({
    userIds,
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
            .deleteUsers(userIds)
            .then(() => {
                addSuccess(userManagementMessages.usersDeleteSuccess);
                onSuccess();
                onClose();
            })
            .catch((error) => {
                console.error("Delete of users failed", error);
                addError(userManagementMessages.usersDeletedFailure);
            });

    return (
        <DeleteConfirmDialog
            titleText={intl.formatMessage(userManagementMessages.deleteUsersConfirmTitle)}
            bodyText={intl.formatMessage(userManagementMessages.deleteUsersConfirmBody, {
                b: (chunks: ReactNode) => <b>{chunks}</b>,
                count: userIds.length,
            })}
            onConfirm={onConfirm}
            onCancel={onClose}
        />
    );
};
