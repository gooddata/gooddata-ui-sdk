// (C) 2023-2026 GoodData Corporation

import { useCallback, useEffect } from "react";

import { useIntl } from "react-intl";

import { type ILocalizationStatistics, type IUserLocalizationSettings } from "@gooddata/sdk-backend-spi";
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
    isLocalizationEnabled?: boolean;
    languages?: IUserLocalizationSettings;
    isLanguagesError?: boolean;
    statistics?: ILocalizationStatistics;
    onLanguagesSaveFailed?: () => void;
    onSubmit: (user: IUser, isAdmin: boolean, languages?: IUserLocalizationSettings) => void;
    onCancel: () => void;
    onClose: () => void;
    removeAdminGroup: () => Promise<void>;
}

export function EditUserDetails({
    user,
    isBootstrapUser,
    isAdmin,
    enableBackButton,
    changeUserMembership,
    isSystemAccountFilteringEnabled,
    isLocalizationEnabled,
    languages,
    isLanguagesError,
    statistics,
    onLanguagesSaveFailed,
    onSubmit,
    onCancel,
    onClose,
    removeAdminGroup,
}: IEditUserDetailsProps) {
    const intl = useIntl();
    const {
        updatedUser,
        isUpdatedAdmin,
        updatedLanguages,
        isProcessing,
        onSave,
        onChange,
        onLanguagesChange,
        isDirty,
    } = useUserDetails(
        user,
        isAdmin,
        onSubmit,
        onCancel,
        removeAdminGroup,
        isSystemAccountFilteringEnabled,
        languages,
        onLanguagesSaveFailed,
    );

    // change user membership if dialog was opened for that reason, enable Save button, do it just once
    useEffect(() => {
        if (changeUserMembership) {
            onChange(updatedUser!, !isUpdatedAdmin);
        }
        // oxlint-disable-next-line react-hooks/exhaustive-deps
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
                isLocalizationEnabled={isLocalizationEnabled}
                languages={updatedLanguages}
                isLanguagesError={isLanguagesError}
                statistics={statistics}
                onChange={onChange}
                onLanguagesChange={onLanguagesChange}
            />
        </ConfirmDialogBase>
    );
}
