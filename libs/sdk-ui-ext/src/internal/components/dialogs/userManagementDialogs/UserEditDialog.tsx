// (C) 2023-2025 GoodData Corporation

import { type ReactElement, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { isUnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { LoadingComponent } from "@gooddata/sdk-ui";
import { type IAlignPoint, Message, Overlay, Tabs } from "@gooddata/sdk-ui-kit";

import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";
import { AddDataSource } from "./DataSources/AddDataSource.js";
import { DataSourceList } from "./DataSources/DataSourceList.js";
import { EditUserDetails } from "./Details/EditUserDetails.js";
import { UserDetailsView } from "./Details/UserDetailsView.js";
import {
    useDeleteDialog,
    useDeleteUser,
    useOrganizationDetails,
    useUser,
    useUserDialogMode,
    useUserDialogTabs,
    useUserGroups,
} from "./dialogHooks.js";
import { ErrorDialog } from "./ErrorDialog.js";
import { usePermissions } from "./hooks/usePermissions.js";
import { messages, userDialogTabsMessages } from "./locales.js";
import { OrganizationIdProvider } from "./OrganizationIdContext.js";
import { type IWithTelemetryProps, withTelemetry } from "./TelemetryContext.js";
import {
    type IGrantedDataSource,
    type IGrantedWorkspace,
    type UserEditDialogMode,
    type UserTabId,
} from "./types.js";
import { AddUserGroup } from "./UserGroups/AddUserGroup.js";
import { UserGroupsList } from "./UserGroups/UserGroupsList.js";
import { extractUserName } from "./utils.js";
import { ViewDialog } from "./ViewDialog.js";
import { AddWorkspace } from "./Workspace/AddWorkspace.js";
import { WorkspaceList } from "./Workspace/WorkspaceList.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export interface IUserEditDialogProps extends IWithTelemetryProps {
    userId: string;
    organizationId: string;
    isAdmin: boolean;
    initialView?: UserEditDialogMode;
    changeUserMembership?: boolean;
    onSuccess: () => void;
    onClose: () => void;
    renderDataSourceIcon?: (dataSource: IGrantedDataSource) => ReactElement;
    areFilterViewsEnabled?: boolean;
    selectedTab?: UserTabId;
}

function UserEditDialogComponent({
    userId,
    organizationId,
    isAdmin,
    onSuccess,
    onClose,
    initialView = "VIEW",
    changeUserMembership = false,
    renderDataSourceIcon,
    areFilterViewsEnabled = false,
    selectedTab = undefined,
}: IUserEditDialogProps) {
    const intl = useIntl();
    const { dialogMode, setDialogMode } = useUserDialogMode(initialView);
    const {
        user,
        isCurrentlyAdmin,
        onUserDetailsChanged,
        setIsAdmin,
        error,
        isLoading: userIsLoading,
    } = useUser(userId, organizationId, isAdmin, onSuccess);
    const { isBootstrapUser, bootstrapUserGroupId } = useOrganizationDetails(organizationId);
    const {
        grantedWorkspaces,
        onWorkspacesChanged,
        removeGrantedWorkspace,
        updateGrantedWorkspace,
        grantedDataSources,
        onDataSourcesChanged,
        removeGrantedDataSource,
        updateGrantedDataSource,
    } = usePermissions(userId, "user", organizationId, onSuccess);
    const { grantedUserGroups, onUserGroupsChanged, removeGrantedUserGroup, removeAdminGroup } =
        useUserGroups(userId, organizationId, bootstrapUserGroupId!, onSuccess, setIsAdmin);

    const { tabs, selectedTabId, setSelectedTabId } = useUserDialogTabs(
        grantedWorkspaces,
        grantedUserGroups!,
        grantedDataSources,
        isCurrentlyAdmin,
        selectedTab,
    );
    const {
        isConfirmDeleteOpened,
        onOpenDeleteDialog,
        onCloseDeleteDialog,
        dialogOverlayClassNames,
        dialogWrapperClassNames,
    } = useDeleteDialog();
    const { deleteUser, isDeleteUserProcessing } = useDeleteUser(userId, organizationId, onSuccess, onClose);

    const { editButtonText, editButtonMode, editButtonIconClassName } = useMemo(() => {
        if (selectedTabId.id === userDialogTabsMessages.workspaces.id) {
            return {
                editButtonMode: "WORKSPACE" as const,
                editButtonIconClassName: "gd-icon-add",
                editButtonText: intl.formatMessage(messages.addWorkspaceButton),
            };
        }
        if (selectedTabId.id === userDialogTabsMessages.userGroups.id) {
            return {
                editButtonMode: "USER_GROUPS" as const,
                editButtonIconClassName: "gd-icon-add",
                editButtonText: intl.formatMessage(messages.addUserGroupButton),
            };
        }
        if (selectedTabId.id === userDialogTabsMessages.dataSources.id) {
            return {
                editButtonMode: "DATA_SOURCES" as const,
                editButtonIconClassName: "gd-icon-add",
                editButtonText: intl.formatMessage(messages.addDataSourcePermissionButton),
            };
        }
        return {
            editButtonMode: "DETAIL" as const,
            editButtonIconClassName: "gd-icon-pencil gd-user-management-dialog-edit-mode-icon",
            editButtonText: intl.formatMessage(messages.editUserButton),
        };
    }, [intl, selectedTabId]);

    const isLoading = error
        ? false
        : userIsLoading || !grantedWorkspaces || !grantedUserGroups || !grantedDataSources;

    const isOpenedInEditMode = initialView !== "VIEW";

    const [workspaceToEdit, setWorkspaceToEdit] = useState<IGrantedWorkspace | undefined>(undefined);

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

    return (
        <OrganizationIdProvider organizationId={organizationId}>
            {isConfirmDeleteOpened ? (
                <DeleteConfirmDialog
                    titleText={intl.formatMessage(messages.deleteUserConfirmTitle)}
                    bodyText={intl.formatMessage(messages.deleteUserConfirmBody)}
                    onConfirm={deleteUser}
                    isProcessing={isDeleteUserProcessing}
                    onCancel={onCloseDeleteDialog}
                />
            ) : null}
            <Overlay
                alignPoints={alignPoints}
                isModal
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
                            dialogTitle={intl.formatMessage(messages.userLoadingErrorTitle)}
                        >
                            <Message type="error" className="gd-user-management-dialog-error">
                                {intl.formatMessage(
                                    isUnexpectedResponseError(error) && error.httpStatus === 404
                                        ? messages.userLoadingErrorNotExist
                                        : messages.userLoadingErrorUnknown,
                                )}
                            </Message>
                        </ErrorDialog>
                    ) : (
                        <>
                            {dialogMode === "VIEW" && (
                                <ViewDialog
                                    dialogTitle={extractUserName(user)}
                                    isAdmin={isCurrentlyAdmin}
                                    isDeleteLinkEnabled={!isBootstrapUser(user)}
                                    deleteLinkDisabledTooltipTextId={messages.deleteUserDisabledTooltip.id}
                                    deleteLinkText={intl.formatMessage(messages.deleteUserLink)}
                                    onOpenDeleteDialog={onOpenDeleteDialog}
                                    onClose={onClose}
                                    onEdit={() => setDialogMode(editButtonMode)}
                                    editButtonText={editButtonText}
                                    editButtonIconClassName={editButtonIconClassName}
                                >
                                    {isCurrentlyAdmin ? (
                                        <div className="gd-message information gd-user-management-admin-alert s-admin-message">
                                            <div className="gd-message-text">
                                                {intl.formatMessage(messages.adminAlert)}
                                            </div>
                                        </div>
                                    ) : null}
                                    <Tabs
                                        selectedTabId={selectedTabId.id}
                                        onTabSelect={setSelectedTabId}
                                        tabs={tabs}
                                        className="gd-user-management-dialog-tabs s-user-management-tabs"
                                    />
                                    {selectedTabId.id === userDialogTabsMessages.workspaces.id && (
                                        <WorkspaceList
                                            workspaces={grantedWorkspaces}
                                            subjectType="user"
                                            mode="VIEW"
                                            onDelete={removeGrantedWorkspace}
                                            onChange={updateGrantedWorkspace}
                                            areFilterViewsEnabled={areFilterViewsEnabled}
                                            onClick={handleWorkspaceEdit}
                                        />
                                    )}
                                    {selectedTabId.id === userDialogTabsMessages.userGroups.id && (
                                        <UserGroupsList
                                            userGroups={grantedUserGroups}
                                            mode="VIEW"
                                            onDelete={removeGrantedUserGroup}
                                            isBootstrapUser={isBootstrapUser(user)}
                                            bootstrapUserGroupId={bootstrapUserGroupId}
                                        />
                                    )}
                                    {selectedTabId.id === userDialogTabsMessages.details.id && (
                                        <UserDetailsView
                                            user={user}
                                            isAdmin={isCurrentlyAdmin}
                                            isBootstrapUser={isBootstrapUser(user)}
                                            mode="VIEW"
                                        />
                                    )}
                                    {selectedTabId.id === userDialogTabsMessages.dataSources.id && (
                                        <DataSourceList
                                            dataSources={grantedDataSources}
                                            subjectType="user"
                                            mode="VIEW"
                                            onDelete={removeGrantedDataSource}
                                            onChange={updateGrantedDataSource}
                                            renderDataSourceIcon={renderDataSourceIcon}
                                        />
                                    )}
                                </ViewDialog>
                            )}
                            {dialogMode === "WORKSPACE" && (
                                <AddWorkspace
                                    ids={[userId]}
                                    subjectType="user"
                                    grantedWorkspaces={grantedWorkspaces}
                                    enableBackButton={!isOpenedInEditMode}
                                    onSubmit={handleWorkspaceChanged}
                                    onCancel={isOpenedInEditMode ? onClose : handleWorkspaceCancel}
                                    onClose={onClose}
                                    areFilterViewsEnabled={areFilterViewsEnabled}
                                    editWorkspace={workspaceToEdit}
                                />
                            )}
                            {dialogMode === "USER_GROUPS" && (
                                <AddUserGroup
                                    userIds={[userId]}
                                    grantedUserGroups={grantedUserGroups}
                                    enableBackButton={!isOpenedInEditMode}
                                    onSubmit={onUserGroupsChanged}
                                    onCancel={isOpenedInEditMode ? onClose : () => setDialogMode("VIEW")}
                                    onClose={onClose}
                                />
                            )}
                            {dialogMode === "DATA_SOURCES" && (
                                <AddDataSource
                                    ids={[userId]}
                                    subjectType="user"
                                    grantedDataSources={grantedDataSources}
                                    enableBackButton={!isOpenedInEditMode}
                                    onSubmit={onDataSourcesChanged}
                                    onCancel={isOpenedInEditMode ? onClose : () => setDialogMode("VIEW")}
                                    onClose={onClose}
                                    renderDataSourceIcon={renderDataSourceIcon}
                                />
                            )}
                            {dialogMode === "DETAIL" && (
                                <EditUserDetails
                                    user={user}
                                    isAdmin={isCurrentlyAdmin}
                                    isBootstrapUser={isBootstrapUser(user)}
                                    enableBackButton={!isOpenedInEditMode}
                                    changeUserMembership={changeUserMembership}
                                    onSubmit={onUserDetailsChanged}
                                    onCancel={isOpenedInEditMode ? onClose : () => setDialogMode("VIEW")}
                                    onClose={onClose}
                                    removeAdminGroup={removeAdminGroup}
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
export const UserEditDialog = withTelemetry(UserEditDialogComponent);
