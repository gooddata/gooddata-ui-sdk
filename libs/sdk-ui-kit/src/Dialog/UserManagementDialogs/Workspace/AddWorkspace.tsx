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
    id: string;
    subjectType: WorkspacePermissionSubject;
    grantedWorkspaces: IGrantedWorkspace[];
    onSubmit: (workspaces: IGrantedWorkspace[]) => void;
    onCancel: () => void;
}

export const AddWorkspace: React.FC<IAddWorkspaceProps> = ({
    id,
    subjectType,
    grantedWorkspaces,
    onSubmit,
    onCancel,
}) => {
    const intl = useIntl();
    const { addedWorkspaces, onAdd, onDelete, onChange, onSelect } = useAddWorkspace(
        id,
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
            onClose={onCancel}
            headerLeftButtonRenderer={backButtonRenderer}
        >
            <AddWorkspaceSelect
                addedWorkspaces={addedWorkspaces}
                grantedWorkspaces={grantedWorkspaces}
                onSelectWorkspace={onSelect}
            />
            <WorkspaceList mode="EDIT" workspaces={addedWorkspaces} onDelete={onDelete} onChange={onChange} />
        </ConfirmDialogBase>
    );
};
