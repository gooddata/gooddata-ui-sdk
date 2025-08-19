// (C) 2023-2025 GoodData Corporation

import React, { useCallback } from "react";

import { useIntl } from "react-intl";

import { BackButton, ConfirmDialogBase } from "@gooddata/sdk-ui-kit";

import { AddUserContent } from "./AddUserContent.js";
import { useAddUsers } from "./usersHooks.js";
import { messages } from "../locales.js";
import { IUserMember } from "../types.js";

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
    const { addedUsers, isProcessing, onSelect, onAdd, onDelete } = useAddUsers(
        userGroupIds,
        onSubmit,
        onCancel,
    );

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onCancel} className="s-user-management-navigate-back" />;
    }, [onCancel]);

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-users s-user-management-add-user"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={addedUsers.length === 0 || isProcessing}
            showProgressIndicator={isProcessing}
            headline={intl.formatMessage(messages.addUserDialogTitle)}
            cancelButtonText={intl.formatMessage(messages.addUserDialogCloseButton)}
            submitButtonText={intl.formatMessage(messages.addUserDialogSaveButton)}
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
