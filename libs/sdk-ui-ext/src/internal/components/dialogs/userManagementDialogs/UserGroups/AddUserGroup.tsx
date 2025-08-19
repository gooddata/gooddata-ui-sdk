// (C) 2023-2025 GoodData Corporation

import React, { useCallback } from "react";

import { useIntl } from "react-intl";

import { BackButton, ConfirmDialogBase } from "@gooddata/sdk-ui-kit";

import { AddUserGroupContent } from "./AddUserGroupContent.js";
import { useAddUserGroup } from "./userGroupHooks.js";
import { messages } from "../locales.js";
import { IGrantedUserGroup } from "../types.js";

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
    const { addedUserGroups, isProcessing, onAdd, onSelect, onDelete } = useAddUserGroup(
        userIds,
        onSubmit,
        onCancel,
    );

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onCancel} className="s-user-group-dialog-navigate-back" />;
    }, [onCancel]);

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-users s-user-management-add-user-group"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={addedUserGroups.length === 0 || isProcessing}
            showProgressIndicator={isProcessing}
            headline={intl.formatMessage(messages.addUserGroupDialogTitle)}
            cancelButtonText={intl.formatMessage(messages.addUserGroupDialogCloseButton)}
            submitButtonText={intl.formatMessage(messages.addUserGroupDialogSaveButton)}
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
