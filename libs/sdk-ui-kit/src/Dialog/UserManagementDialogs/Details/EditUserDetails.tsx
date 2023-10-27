// (C) 2023 GoodData Corporation

import { useIntl } from "react-intl";
import React, { useCallback } from "react";
import { IUser } from "@gooddata/sdk-model";

import { BackButton } from "../../BackButton.js";
import { ConfirmDialogBase } from "../../ConfirmDialogBase.js";

import { UserDetailsView } from "./UserDetailsView.js";
import { useUserDetails } from "./detailsHooks.js";
import { extractUserName } from "../utils.js";
import { userManagementMessages } from "../../../locales.js";

export interface IEditUserDetailsProps {
    isAdmin: boolean;
    user: IUser;
    onSubmit: (user: IUser, isAdmin: boolean) => void;
    onCancel: () => void;
}

export const EditUserDetails: React.FC<IEditUserDetailsProps> = ({ user, isAdmin, onSubmit, onCancel }) => {
    const intl = useIntl();
    const { updatedUser, isUpdatedAdmin, onSave, onChange, isDirty } = useUserDetails(
        user,
        isAdmin,
        onSubmit,
        onCancel,
    );

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
            onClose={onCancel}
            headerLeftButtonRenderer={backButtonRenderer}
        >
            <UserDetailsView user={updatedUser} isAdmin={isUpdatedAdmin} mode="EDIT" onChange={onChange} />
        </ConfirmDialogBase>
    );
};
