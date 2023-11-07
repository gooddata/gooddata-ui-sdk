// (C) 2023 GoodData Corporation

import { useIntl } from "react-intl";
import React, { useCallback } from "react";

import { IGrantedUserGroup } from "../types.js";
import { BackButton } from "../../BackButton.js";
import { ConfirmDialogBase } from "../../ConfirmDialogBase.js";

import { AddUserGroupContent } from "./AddUserGroupContent.js";
import { useAddUserGroup } from "./userGroupHooks.js";
import { userManagementMessages } from "../../../locales.js";

export interface IAddUserGroupProps {
    userIds: string[];
    grantedUserGroups: IGrantedUserGroup[];
    enableBackButton?: boolean;
    onSubmit: (userGroups: IGrantedUserGroup[]) => void;
    onCancel: () => void;
    onClose: () => void;
}

export const AddUserGroup: React.FC<IAddUserGroupProps> = ({
    userIds,
    grantedUserGroups,
    enableBackButton = true,
    onSubmit,
    onCancel,
    onClose,
}) => {
    const intl = useIntl();
    const { addedUserGroups, onAdd, onSelect, onDelete } = useAddUserGroup(userIds, onSubmit, onCancel);

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onCancel} className="s-user-group-dialog-navigate-back" />;
    }, [onCancel]);

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-users s-user-management-add-user-group"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={addedUserGroups.length === 0}
            headline={intl.formatMessage(userManagementMessages.addUserGroupDialogTitle)}
            cancelButtonText={intl.formatMessage(userManagementMessages.addUserGroupDialogCloseButton)}
            submitButtonText={intl.formatMessage(userManagementMessages.addUserGroupDialogSaveButton)}
            onCancel={onCancel}
            onSubmit={onAdd}
            onClose={onClose}
            headerLeftButtonRenderer={enableBackButton ? backButtonRenderer : undefined}
        >
            <AddUserGroupContent
                grantedUserGroups={grantedUserGroups}
                addedUserGroups={addedUserGroups}
                onDelete={onDelete}
                onSelect={onSelect}
            />
        </ConfirmDialogBase>
    );
};
