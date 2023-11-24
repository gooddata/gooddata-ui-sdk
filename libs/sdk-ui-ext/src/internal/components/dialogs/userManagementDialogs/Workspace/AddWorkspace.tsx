// (C) 2023 GoodData Corporation

import { useIntl } from "react-intl";
import React, { useCallback } from "react";
import { BackButton, ConfirmDialogBase } from "@gooddata/sdk-ui-kit";

import { IGrantedWorkspace, WorkspacePermissionSubject } from "../types.js";
import { messages } from "../locales.js";

import { AddWorkspaceSelect } from "./AddWorkspaceSelect.js";
import { WorkspaceList } from "./WorkspaceList.js";
import { useAddWorkspace } from "./workspaceHooks.js";

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
    const { addedWorkspaces, isProcessing, onAdd, onDelete, onChange, onSelect } = useAddWorkspace(
        ids,
        subjectType,
        grantedWorkspaces,
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
            isSubmitDisabled={addedWorkspaces.length === 0 || isProcessing}
            showProgressIndicator={isProcessing}
            headline={intl.formatMessage(messages.addWorkspaceDialogTitle)}
            cancelButtonText={intl.formatMessage(messages.addWorkspaceDialogCloseButton)}
            submitButtonText={intl.formatMessage(messages.addWorkspaceDialogSaveButton)}
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
