// (C) 2023 GoodData Corporation

import { useIntl } from "react-intl";
import React, { useCallback } from "react";
import { IUserGroup } from "@gooddata/sdk-model";
import { BackButton, ConfirmDialogBase } from "@gooddata/sdk-ui-kit";

import { extractUserGroupName } from "../utils.js";
import { messages } from "../locales.js";

import { UserGroupDetailsView } from "./UserGroupDetailsView.js";
import { useUserGroupDetails } from "./detailsHooks.js";

export interface IEditUserGroupDetailsProps {
    userGroup: IUserGroup;
    enableBackButton?: boolean;
    onSubmit: (userGroup: IUserGroup) => void;
    onCancel: () => void;
    onClose: () => void;
}

export const EditUserGroupDetails: React.FC<IEditUserGroupDetailsProps> = ({
    userGroup,
    enableBackButton,
    onSubmit,
    onCancel,
    onClose,
}) => {
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
            displayCloseButton={true}
            isPositive={true}
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
};
