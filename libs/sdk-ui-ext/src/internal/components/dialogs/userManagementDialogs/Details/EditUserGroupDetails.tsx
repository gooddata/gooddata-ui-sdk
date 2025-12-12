// (C) 2023-2025 GoodData Corporation

import { useCallback } from "react";

import { useIntl } from "react-intl";

import { type IUserGroup } from "@gooddata/sdk-model";
import { BackButton, ConfirmDialogBase } from "@gooddata/sdk-ui-kit";

import { useUserGroupDetails } from "./detailsHooks.js";
import { UserGroupDetailsView } from "./UserGroupDetailsView.js";
import { messages } from "../locales.js";
import { extractUserGroupName } from "../utils.js";

export interface IEditUserGroupDetailsProps {
    userGroup: IUserGroup;
    enableBackButton?: boolean;
    onSubmit: (userGroup: IUserGroup) => void;
    onCancel: () => void;
    onClose: () => void;
}

export function EditUserGroupDetails({
    userGroup,
    enableBackButton,
    onSubmit,
    onCancel,
    onClose,
}: IEditUserGroupDetailsProps) {
    const intl = useIntl();
    const { updatedUserGroup, onChange, isProcessing, isDirty, onSave } = useUserGroupDetails(
        userGroup,
        onSubmit,
        onCancel,
    );

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onCancel} className="s-user-management-navigate-back" />;
    }, [onCancel]);

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-users s-user-management-edit-user-group"
            displayCloseButton
            isPositive
            isSubmitDisabled={!isDirty || isProcessing}
            showProgressIndicator={isProcessing}
            headline={extractUserGroupName(userGroup)}
            cancelButtonText={intl.formatMessage(messages.closeEditMode)}
            submitButtonText={intl.formatMessage(messages.saveEditedDetails)}
            onCancel={onCancel}
            onSubmit={onSave}
            onClose={onClose}
            headerLeftButtonRenderer={enableBackButton ? backButtonRenderer : undefined}
        >
            <UserGroupDetailsView userGroup={updatedUserGroup} mode="EDIT" onChange={onChange} />
        </ConfirmDialogBase>
    );
}
