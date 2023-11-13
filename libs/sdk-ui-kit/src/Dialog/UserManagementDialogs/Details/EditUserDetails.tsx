// (C) 2023 GoodData Corporation

import { useIntl } from "react-intl";
import React, { useCallback, useEffect } from "react";
import { IUser } from "@gooddata/sdk-model";

import { BackButton } from "../../BackButton.js";
import { ConfirmDialogBase } from "../../ConfirmDialogBase.js";

import { UserDetailsView } from "./UserDetailsView.js";
import { useUserDetails } from "./detailsHooks.js";
import { extractUserName } from "../utils.js";
import { userManagementMessages } from "../../../locales.js";

export interface IEditUserDetailsProps {
    isAdmin: boolean;
    isBootstrapUser: boolean;
    user: IUser;
    enableBackButton?: boolean;
    changeUserMembership?: boolean;
    onSubmit: (user: IUser, isAdmin: boolean) => void;
    onCancel: () => void;
    onClose: () => void;
}

export const EditUserDetails: React.FC<IEditUserDetailsProps> = ({
    user,
    isBootstrapUser,
    isAdmin,
    enableBackButton,
    changeUserMembership,
    onSubmit,
    onCancel,
    onClose,
}) => {
    const intl = useIntl();
    const { updatedUser, isUpdatedAdmin, onSave, onChange, isDirty } = useUserDetails(
        user,
        isAdmin,
        onSubmit,
        onCancel,
    );

    // change user membership if dialog was opened for that reason, enable Save button, do it just once
    useEffect(() => {
        if (changeUserMembership) {
            onChange(updatedUser, !isUpdatedAdmin);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onCancel} className="s-user-management-navigate-back" />;
    }, [onCancel]);

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-users s-user-management-edit-user"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={!isDirty}
            headline={extractUserName(user)}
            cancelButtonText={intl.formatMessage(userManagementMessages.closeEditMode)}
            submitButtonText={intl.formatMessage(userManagementMessages.saveEditedDetails)}
            onCancel={onCancel}
            onSubmit={onSave}
            onClose={onClose}
            headerLeftButtonRenderer={enableBackButton ? backButtonRenderer : undefined}
        >
            <UserDetailsView
                user={updatedUser}
                isAdmin={isUpdatedAdmin}
                isBootstrapUser={isBootstrapUser}
                mode="EDIT"
                onChange={onChange}
            />
        </ConfirmDialogBase>
    );
};
