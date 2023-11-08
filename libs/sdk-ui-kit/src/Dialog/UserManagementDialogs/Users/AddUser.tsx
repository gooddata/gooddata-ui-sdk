// (C) 2023 GoodData Corporation

import { useIntl } from "react-intl";
import React, { useCallback } from "react";

import { IUserMember } from "../types.js";
import { BackButton } from "../../BackButton.js";
import { ConfirmDialogBase } from "../../ConfirmDialogBase.js";

import { AddUserContent } from "./AddUserContent.js";
import { useAddUsers } from "./usersHooks.js";
import { userManagementMessages } from "../../../locales.js";

export interface IAddUserProps {
    userGroupIds: string[];
    grantedUsers: IUserMember[];
    enableBackButton?: boolean;
    onSubmit: (users: IUserMember[]) => void;
    onCancel: () => void;
    onClose: () => void;
}

export const AddUser: React.FC<IAddUserProps> = ({
    userGroupIds,
    grantedUsers,
    enableBackButton,
    onSubmit,
    onCancel,
    onClose,
}) => {
    const intl = useIntl();
    const { addedUsers, onSelect, onAdd, onDelete } = useAddUsers(userGroupIds, onSubmit, onCancel);

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onCancel} className="s-user-management-navigate-back" />;
    }, [onCancel]);

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-users s-user-management-add-user"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={addedUsers.length === 0}
            headline={intl.formatMessage(userManagementMessages.addUserDialogTitle)}
            cancelButtonText={intl.formatMessage(userManagementMessages.addUserDialogCloseButton)}
            submitButtonText={intl.formatMessage(userManagementMessages.addUserDialogSaveButton)}
            onCancel={onCancel}
            onSubmit={onAdd}
            onClose={onClose}
            headerLeftButtonRenderer={enableBackButton ? backButtonRenderer : undefined}
        >
            <AddUserContent
                grantedUsers={grantedUsers}
                addedUsers={addedUsers}
                onDelete={onDelete}
                onSelect={onSelect}
            />
        </ConfirmDialogBase>
    );
};
