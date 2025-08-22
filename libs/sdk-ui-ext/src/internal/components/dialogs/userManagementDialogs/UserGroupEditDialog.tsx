// (C) 2023-2025 GoodData Corporation

import React, { ReactElement, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { LoadingComponent } from "@gooddata/sdk-ui";
import { IAlignPoint, Message, Overlay, Tabs } from "@gooddata/sdk-ui-kit";

import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";
import { AddDataSource } from "./DataSources/AddDataSource.js";
import { DataSourceList } from "./DataSources/DataSourceList.js";
import { EditUserGroupDetails } from "./Details/EditUserGroupDetails.js";
import { UserGroupDetailsView } from "./Details/UserGroupDetailsView.js";
import {
    useDeleteDialog,
    useDeleteUserGroup,
    useOrganizationDetails,
    useUserGroup,
    useUserGroupDialogMode,
    useUserGroupDialogTabs,
    useUsers,
} from "./dialogHooks.js";
import { ErrorDialog } from "./ErrorDialog.js";
import { usePermissions } from "./hooks/usePermissions.js";
import { messages, userGroupDialogTabsMessages } from "./locales.js";
import { OrganizationIdProvider } from "./OrganizationIdContext.js";
import { IWithTelemetryProps, withTelemetry } from "./TelemetryContext.js";
import { IGrantedDataSource, IGrantedWorkspace, UserGroupEditDialogMode } from "./types.js";
import { AddUser } from "./Users/AddUser.js";
import { UsersList } from "./Users/UsersList.js";
import { extractUserGroupName } from "./utils.js";
import { ViewDialog } from "./ViewDialog.js";
import { AddWorkspace } from "./Workspace/AddWorkspace.js";
import { WorkspaceList } from "./Workspace/WorkspaceList.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export interface IUserGroupEditDialogProps extends IWithTelemetryProps {
    userGroupId: string;
    organizationId: string;
    isAdmin: boolean;
    initialView?: UserGroupEditDialogMode;
    onSuccess: () => void;
    onClose: () => void;
    renderDataSourceIcon?: (dataSource: IGrantedDataSource) => ReactElement;
    areFilterViewsEnabled?: boolean;
}

function UserGroupEditDialogComponent({
    userGroupId,
    organizationId,
    isAdmin,
    onSuccess,
    onClose,
    initialView = "VIEW",
    renderDataSourceIcon,
    areFilterViewsEnabled = false,
}: IUserGroupEditDialogProps) {
    const intl = useIntl();
    const { dialogMode, setDialogMode } = useUserGroupDialogMode(initialView);
    const {
        userGroup,
        onUserGroupDetailsChanged,
        error,
        isLoading: userGroupIsLoading,
    } = useUserGroup(userGroupId, organizationId, onSuccess);
    const {
        grantedWorkspaces,
        onWorkspacesChanged,
        removeGrantedWorkspace,
        updateGrantedWorkspace,
        grantedDataSources,
        onDataSourcesChanged,
        removeGrantedDataSource,
        updateGrantedDataSource,
    } = usePermissions(userGroupId, "userGroup", organizationId, onSuccess);
    const { grantedUsers, onUsersChanged, removeGrantedUsers } = useUsers(
        userGroupId,
        organizationId,
        onSuccess,
    );

    const { tabs, selectedTabId, setSelectedTabId } = useUserGroupDialogTabs(
        grantedWorkspaces,
        grantedUsers,
        grantedDataSources,
        isAdmin,
    );
    const {
        isConfirmDeleteOpened,
        onOpenDeleteDialog,
        onCloseDeleteDialog,
        dialogOverlayClassNames,
        dialogWrapperClassNames,
    } = useDeleteDialog();
    const { deleteUserGroup, isDeleteUserGroupProcessing } = useDeleteUserGroup(
        userGroupId,
        organizationId,
        onSuccess,
        onClose,
    );
    const { isBootstrapUserGroup, bootstrapUserId } = useOrganizationDetails(organizationId);

    const { editButtonText, editButtonMode, editButtonIconClassName } = useMemo(() => {
        if (selectedTabId.id === userGroupDialogTabsMessages.workspaces.id) {
            return {
                editButtonMode: "WORKSPACE" as const,
                editButtonIconClassName: "gd-icon-add",
                editButtonText: intl.formatMessage(messages.addWorkspaceButton),
            };
        }
        if (selectedTabId.id === userGroupDialogTabsMessages.dataSources.id) {
            return {
                editButtonMode: "DATA_SOURCES" as const,
                editButtonIconClassName: "gd-icon-add",
                editButtonText: intl.formatMessage(messages.addDataSourcePermissionButton),
            };
        }
        if (selectedTabId.id === userGroupDialogTabsMessages.users.id) {
            return {
                editButtonMode: "USERS" as const,
                editButtonIconClassName: "gd-icon-add",
                editButtonText: intl.formatMessage(messages.addUserButton),
            };
        }
        return {
            editButtonMode: "DETAIL" as const,
            editButtonIconClassName: "gd-icon-pencil gd-user-management-dialog-edit-mode-icon",
            editButtonText: intl.formatMessage(messages.editUserGroupButton),
        };
    }, [intl, selectedTabId]);

    const isOpenedInEditMode = initialView !== "VIEW";

    const [workspaceToEdit, setWorkspaceToEdit] = useState<IGrantedWorkspace>(undefined);

    const handleWorkspaceEdit = (workspace: IGrantedWorkspace) => {
        setWorkspaceToEdit(workspace);
        setDialogMode("WORKSPACE");
    };

    const handleWorkspaceChanged = (workspaces: IGrantedWorkspace[]) => {
        setWorkspaceToEdit(undefined);
        onWorkspacesChanged(workspaces);
    };

    const handleWorkspaceCancel = () => {
        setWorkspaceToEdit(undefined);
        setDialogMode("VIEW");
    };

    const isLoading = error
        ? false
        : userGroupIsLoading || !grantedWorkspaces || !grantedUsers || !grantedDataSources;

    return (
        <OrganizationIdProvider organizationId={organizationId}>
            {isConfirmDeleteOpened ? (
                <DeleteConfirmDialog
                    titleText={extractUserGroupName(userGroup)}
                    bodyText={intl.formatMessage(messages.deleteUserGroupConfirmBody)}
                    isProcessing={isDeleteUserGroupProcessing}
                    onConfirm={deleteUserGroup}
                    onCancel={onCloseDeleteDialog}
                />
            ) : null}
            <Overlay
                alignPoints={alignPoints}
                isModal={true}
                positionType="fixed"
                className={dialogOverlayClassNames}
                resizeObserverThreshold={0.2}
            >
                <div className={dialogWrapperClassNames}>
                    {isLoading ? (
                        <>
                            <LoadingComponent className="gd-user-management-dialog-loading" />
                            <ErrorDialog dialogTitle="" onClose={onClose} />
                        </>
                    ) : error ? (
                        <ErrorDialog
                            onClose={onClose}
                            dialogTitle={intl.formatMessage(messages.userGroupLoadingErrorTitle)}
                        >
                            <Message type="error" className="gd-user-management-dialog-error">
                                {intl.formatMessage(
                                    isUnexpectedResponseError(error) && error.httpStatus === 404
                                        ? messages.userGroupLoadingErrorNotExist
                                        : messages.userGroupLoadingErrorUnknown,
                                )}
                            </Message>
                        </ErrorDialog>
                    ) : (
                        <>
                            {dialogMode === "VIEW" && (
                                <ViewDialog
                                    dialogTitle={extractUserGroupName(userGroup)}
                                    isAdmin={isAdmin}
                                    isDeleteLinkEnabled={
                                        !isBootstrapUserGroup(userGroup) && grantedUsers?.length === 0
                                    }
                                    deleteLinkDisabledTooltipTextId={
                                        isBootstrapUserGroup(userGroup)
                                            ? messages.deleteAdminUserGroupTooltip.id
                                            : messages.deleteNonEmptyUserGroupTooltip.id
                                    }
                                    deleteLinkText={intl.formatMessage(messages.deleteUserGroupLink)}
                                    onOpenDeleteDialog={onOpenDeleteDialog}
                                    onClose={onClose}
                                    onEdit={() => setDialogMode(editButtonMode)}
                                    editButtonText={editButtonText}
                                    editButtonIconClassName={editButtonIconClassName}
                                >
                                    {isAdmin ? (
                                        <div className="gd-message information gd-user-management-admin-alert s-admin-message">
                                            <div className="gd-message-text">
                                                {intl.formatMessage(messages.adminGroupAlert)}
                                            </div>
                                        </div>
                                    ) : null}
                                    <Tabs
                                        selectedTabId={selectedTabId.id}
                                        onTabSelect={setSelectedTabId}
                                        tabs={tabs}
                                        className="gd-user-management-dialog-tabs s-user-management-tabs"
                                    />
                                    {selectedTabId.id === userGroupDialogTabsMessages.workspaces.id && (
                                        <WorkspaceList
                                            workspaces={grantedWorkspaces}
                                            subjectType="userGroup"
                                            mode="VIEW"
                                            onDelete={removeGrantedWorkspace}
                                            onChange={updateGrantedWorkspace}
                                            areFilterViewsEnabled={areFilterViewsEnabled}
                                            onClick={handleWorkspaceEdit}
                                        />
                                    )}
                                    {selectedTabId.id === userGroupDialogTabsMessages.dataSources.id && (
                                        <DataSourceList
                                            dataSources={grantedDataSources}
                                            subjectType="userGroup"
                                            mode="VIEW"
                                            onDelete={removeGrantedDataSource}
                                            onChange={updateGrantedDataSource}
                                            renderDataSourceIcon={renderDataSourceIcon}
                                        />
                                    )}
                                    {selectedTabId.id === userGroupDialogTabsMessages.users.id && (
                                        <UsersList
                                            users={grantedUsers}
                                            mode="VIEW"
                                            onDelete={removeGrantedUsers}
                                            isBootstrapUserGroup={isBootstrapUserGroup(userGroup)}
                                            bootstrapUserId={bootstrapUserId}
                                        />
                                    )}
                                    {selectedTabId.id === userGroupDialogTabsMessages.details.id && (
                                        <UserGroupDetailsView userGroup={userGroup} mode="VIEW" />
                                    )}
                                </ViewDialog>
                            )}
                            {dialogMode === "WORKSPACE" && (
                                <AddWorkspace
                                    ids={[userGroupId]}
                                    subjectType="userGroup"
                                    grantedWorkspaces={grantedWorkspaces}
                                    enableBackButton={!isOpenedInEditMode}
                                    onSubmit={handleWorkspaceChanged}
                                    onCancel={isOpenedInEditMode ? onClose : handleWorkspaceCancel}
                                    onClose={onClose}
                                    areFilterViewsEnabled={areFilterViewsEnabled}
                                    editWorkspace={workspaceToEdit}
                                />
                            )}
                            {dialogMode === "USERS" && (
                                <AddUser
                                    userGroupIds={[userGroupId]}
                                    grantedUsers={grantedUsers}
                                    enableBackButton={!isOpenedInEditMode}
                                    onSubmit={onUsersChanged}
                                    onCancel={isOpenedInEditMode ? onClose : () => setDialogMode("VIEW")}
                                    onClose={onClose}
                                />
                            )}
                            {dialogMode === "DATA_SOURCES" && (
                                <AddDataSource
                                    ids={[userGroupId]}
                                    subjectType="userGroup"
                                    grantedDataSources={grantedDataSources}
                                    enableBackButton={!isOpenedInEditMode}
                                    onSubmit={onDataSourcesChanged}
                                    onCancel={isOpenedInEditMode ? onClose : () => setDialogMode("VIEW")}
                                    onClose={onClose}
                                    renderDataSourceIcon={renderDataSourceIcon}
                                />
                            )}
                            {dialogMode === "DETAIL" && (
                                <EditUserGroupDetails
                                    userGroup={userGroup}
                                    enableBackButton={!isOpenedInEditMode}
                                    onSubmit={onUserGroupDetailsChanged}
                                    onCancel={isOpenedInEditMode ? onClose : () => setDialogMode("VIEW")}
                                    onClose={onClose}
                                />
                            )}
                        </>
                    )}
                </div>
            </Overlay>
        </OrganizationIdProvider>
    );
}

/**
 * @internal
 */
export const UserGroupEditDialog = withTelemetry(UserGroupEditDialogComponent);
