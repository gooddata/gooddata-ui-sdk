// (C) 2023 GoodData Corporation

import { useIntl } from "react-intl";
import React, { useCallback } from "react";

import { IGrantedWorkspace, WorkspacePermissionSubject } from "../types.js";
import { BackButton } from "../../BackButton.js";
import { ConfirmDialogBase } from "../../ConfirmDialogBase.js";

import { AddWorkspaceSelect } from "./AddWorkspaceSelect.js";
import { WorkspaceList } from "./WorkspaceList.js";
import { useAddWorkspace } from "./workspaceHooks.js";
import { userManagementMessages } from "../../../locales.js";

export interface IAddWorkspaceProps {
    ids: string[];
    subjectType: WorkspacePermissionSubject;
    grantedWorkspaces: IGrantedWorkspace[];
    enableBackButton?: boolean;
    onSubmit: (workspaces: IGrantedWorkspace[]) => void;
    onCancel: () => void;
    onClose: () => void;
}

export const AddWorkspace: React.FC<IAddWorkspaceProps> = ({
    ids,
    subjectType,
    grantedWorkspaces,
    enableBackButton,
    onSubmit,
    onCancel,
    onClose,
}) => {
    const intl = useIntl();
    const { addedWorkspaces, onAdd, onDelete, onChange, onSelect } = useAddWorkspace(
        ids,
        subjectType,
        onSubmit,
        onCancel,
    );

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onCancel} className="s-user-management-navigate-back" />;
    }, [onCancel]);

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-users s-user-management-add-workspace"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={addedWorkspaces.length === 0}
            headline={intl.formatMessage(userManagementMessages.addWorkspaceDialogTitle)}
            cancelButtonText={intl.formatMessage(userManagementMessages.addWorkspaceDialogCloseButton)}
            submitButtonText={intl.formatMessage(userManagementMessages.addWorkspaceDialogSaveButton)}
            onCancel={onCancel}
            onSubmit={onAdd}
            onClose={onClose}
            headerLeftButtonRenderer={enableBackButton ? backButtonRenderer : undefined}
        >
            <AddWorkspaceSelect
                addedWorkspaces={addedWorkspaces}
                grantedWorkspaces={grantedWorkspaces}
                onSelectWorkspace={onSelect}
            />
            <WorkspaceList
                subjectType={subjectType}
                mode="EDIT"
                workspaces={addedWorkspaces}
                onDelete={onDelete}
                onChange={onChange}
            />
        </ConfirmDialogBase>
    );
};
