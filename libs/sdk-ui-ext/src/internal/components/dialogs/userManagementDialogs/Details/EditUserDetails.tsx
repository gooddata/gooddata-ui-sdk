// (C) 2023-2026 GoodData Corporation

import { useCallback, useEffect } from "react";

import { useIntl } from "react-intl";

import { type IUser } from "@gooddata/sdk-model";
import { BackButton, ConfirmDialogBase } from "@gooddata/sdk-ui-kit";

import { messages } from "../locales.js";
import { extractUserName } from "../utils.js";

import { useUserDetails } from "./detailsHooks.js";
import { UserDetailsView } from "./UserDetailsView.js";

export interface IEditUserDetailsProps {
    isAdmin: boolean;
    isBootstrapUser: boolean;
    user: IUser | undefined;
    enableBackButton?: boolean;
    changeUserMembership?: boolean;
    isSystemAccountFilteringEnabled?: boolean;
    onSubmit: (user: IUser, isAdmin: boolean) => void;
    onCancel: () => void;
    onClose: () => void;
    removeAdminGroup: () => void;
}

export function EditUserDetails({
    user,
    isBootstrapUser,
    isAdmin,
    enableBackButton,
    changeUserMembership,
    isSystemAccountFilteringEnabled,
    onSubmit,
    onCancel,
    onClose,
    removeAdminGroup,
}: IEditUserDetailsProps) {
    const intl = useIntl();
    const { updatedUser, isUpdatedAdmin, isProcessing, onSave, onChange, isDirty } = useUserDetails(
        user,
        isAdmin,
        onSubmit,
        onCancel,
        removeAdminGroup,
        isSystemAccountFilteringEnabled,
    );

    // change user membership if dialog was opened for that reason, enable Save button, do it just once
    useEffect(() => {
        if (changeUserMembership) {
            onChange(updatedUser!, !isUpdatedAdmin);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onCancel} className="s-user-management-navigate-back" />;
    }, [onCancel]);

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-users s-user-management-edit-user"
            displayCloseButton
            isPositive
            isSubmitDisabled={!isDirty || isProcessing}
            showProgressIndicator={isProcessing}
            headline={extractUserName(user)}
            cancelButtonText={intl.formatMessage(messages.closeEditMode)}
            submitButtonText={intl.formatMessage(messages.saveEditedDetails)}
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
                isSystemAccountFilteringEnabled={isSystemAccountFilteringEnabled}
                onChange={onChange}
            />
        </ConfirmDialogBase>
    );
}
