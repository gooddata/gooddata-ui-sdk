// (C) 2023 GoodData Corporation

import React, { ReactNode } from "react";
import { useIntl } from "react-intl";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { messages } from "./locales.js";
import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";

/**
 * @internal
 */
export interface IDeleteUserGroupsDialogProps {
    userGroupIds: string[];
    organizationId: string;
    onSuccess: () => void;
    onClose: () => void;
}

/**
 * @internal
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
                addSuccess(messages.userGroupsDeleteSuccess);
                onSuccess();
                onClose();
            })
            .catch((error) => {
                console.error("Delete of user groups failed", error);
                addError(messages.userGroupsDeleteFailure);
            });

    return (
        <DeleteConfirmDialog
            titleText={intl.formatMessage(messages.deleteUserGroupsConfirmTitle)}
            bodyText={intl.formatMessage(messages.deleteUserGroupsConfirmBody, {
                b: (chunks: ReactNode) => <b>{chunks}</b>,
                br: <br />,
                count: userGroupIds.length,
            })}
            onConfirm={onConfirm}
            onCancel={onClose}
        />
    );
};
