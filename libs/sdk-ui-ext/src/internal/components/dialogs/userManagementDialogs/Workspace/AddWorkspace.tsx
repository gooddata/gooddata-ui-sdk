// (C) 2023-2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { BackButton, ConfirmDialogBase, Hyperlink } from "@gooddata/sdk-ui-kit";

import { AddSingleWorkspaceSelect } from "./AddSingleWorkspaceSelect.js";
import { useAddWorkspace } from "./useAddWorkspace.js";
import { messages } from "../locales.js";
import { IGrantedWorkspace, WorkspacePermissionSubject } from "../types.js";
import { GranularPermissions } from "./WorkspaceItem/GranularPermissions.js";
import {
    areRedundantPermissionsPresent,
    areWorkspacePermissionsEqual,
} from "./WorkspaceItem/granularPermissionUtils.js";

export interface IAddWorkspaceProps {
    ids: string[];
    subjectType: WorkspacePermissionSubject;
    grantedWorkspaces: IGrantedWorkspace[];
    enableBackButton?: boolean;
    onSubmit: (workspaces: IGrantedWorkspace[]) => void;
    onCancel: () => void;
    onClose: () => void;
    areFilterViewsEnabled: boolean;
    editWorkspace?: IGrantedWorkspace;
}

export function AddWorkspace({
    ids,
    subjectType,
    grantedWorkspaces,
    enableBackButton,
    onSubmit,
    onCancel,
    onClose,
    areFilterViewsEnabled,
    editWorkspace,
}: IAddWorkspaceProps) {
    const intl = useIntl();
    const { addedWorkspaces, isProcessing, onAdd, onChange, onOverwriteSelect } = useAddWorkspace(
        ids,
        subjectType,
        onSubmit,
        onCancel,
        editWorkspace,
    );

    const isGranularPermissionsChanged = useMemo(() => {
        return editWorkspace ? areWorkspacePermissionsEqual(addedWorkspaces[0], editWorkspace) : true;
    }, [addedWorkspaces, editWorkspace]);

    const showRedundancyWarningMessage = useMemo(() => {
        return editWorkspace ? areRedundantPermissionsPresent(editWorkspace.permissions) : false;
    }, [editWorkspace]);

    const backButtonRenderer = useCallback(() => {
        return <BackButton onClick={onCancel} className="s-user-management-navigate-back" />;
    }, [onCancel]);

    const leftFooterRenderer = useCallback(() => {
        return (
            <div className="gd-share-dialog-add-workspace__footer-link">
                <Hyperlink
                    text={intl.formatMessage({
                        id: "userManagement.workspace.granularPermission.help",
                    })}
                    href="https://www.gooddata.com/docs/cloud/manage-organization/manage-permissions/set-permissions-for-workspace/"
                    iconClass="gd-icon-circle-question"
                />
            </div>
        );
    }, [intl]);

    return (
        <ConfirmDialogBase
            className="gd-share-dialog gd-share-dialog-add-workspace s-user-management-add-workspace"
            displayCloseButton={true}
            isPositive={true}
            isSubmitDisabled={addedWorkspaces.length === 0 || isProcessing || !isGranularPermissionsChanged}
            showProgressIndicator={isProcessing}
            headline={intl.formatMessage(
                editWorkspace ? messages.editWorkspaceDialogTitle : messages.addWorkspaceDialogTitle,
            )}
            cancelButtonText={intl.formatMessage(messages.addWorkspaceDialogCloseButton)}
            submitButtonText={intl.formatMessage(messages.addWorkspaceDialogSaveButton)}
            onCancel={onCancel}
            onSubmit={onAdd}
            onClose={onClose}
            headerLeftButtonRenderer={enableBackButton ? backButtonRenderer : undefined}
            footerLeftRenderer={leftFooterRenderer}
        >
            <AddSingleWorkspaceSelect
                addedWorkspace={addedWorkspaces[0]}
                grantedWorkspaces={grantedWorkspaces}
                onSelectWorkspace={onOverwriteSelect}
                mode={editWorkspace ? "VIEW" : "EDIT"}
            />
            <GranularPermissions
                workspace={addedWorkspaces[0]}
                onChange={onChange}
                areFilterViewsEnabled={areFilterViewsEnabled}
                showRedundancyWarningMessage={showRedundancyWarningMessage}
            />
        </ConfirmDialogBase>
    );
}
