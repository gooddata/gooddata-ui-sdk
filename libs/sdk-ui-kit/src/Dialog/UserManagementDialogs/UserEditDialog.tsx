// (C) 2023 GoodData Corporation

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { LoadingComponent } from "@gooddata/sdk-ui";

import { Tabs } from "../../Tabs/index.js";
import { userDialogTabsMessageLabels, userManagementMessages } from "../../locales.js";
import { Overlay } from "../../Overlay/index.js";
import { IAlignPoint } from "../../typings/positioning.js";

import { WorkspaceList } from "./Workspace/WorkspaceList.js";
import { AddWorkspace } from "./Workspace/AddWorkspace.js";
import { UserDetailsView } from "./Details/UserDetailsView.js";
import { UserGroupsList } from "./UserGroups/UserGroupsList.js";
import { EditUserDetails } from "./Details/EditUserDetails.js";
import { AddUserGroup } from "./UserGroups/AddUserGroup.js";
import {
    useUserDialogTabs,
    useUserGroups,
    useUser,
    useWorkspaces,
    useUserDialogMode,
    useDeleteUser,
    useDeleteDialog,
    useIsOrganizationBootstrapUser,
} from "./dialogHooks.js";
import { ViewDialog } from "./ViewDialog.js";
import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";
import { OrganizationIdProvider } from "./OrganizationIdContext.js";
import { extractUserName } from "./utils.js";
import { UserEditDialogMode } from "./types.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export interface IUserEditDialogProps {
    userId: string;
    organizationId: string;
    isAdmin: boolean;
    initialView?: UserEditDialogMode;
    changeUserMembership?: boolean;
    onSuccess: () => void;
    onClose: () => void;
}

/**
 * @internal
 */
export const UserEditDialog: React.FC<IUserEditDialogProps> = ({
    userId,
    organizationId,
    isAdmin,
    onSuccess,
    onClose,
    initialView = "VIEW",
    changeUserMembership = false,
}) => {
    const intl = useIntl();
    const { dialogMode, setDialogMode } = useUserDialogMode(initialView);
    const { user, isCurrentlyAdmin, onUserDetailsChanged } = useUser(
        userId,
        organizationId,
        isAdmin,
        onSuccess,
    );
    const { grantedWorkspaces, onWorkspacesChanged, removeGrantedWorkspace, updateGrantedWorkspace } =
        useWorkspaces(userId, "user", organizationId, onSuccess);
    const { grantedUserGroups, onUserGroupsChanged, removeGrantedUserGroup } = useUserGroups(
        userId,
        organizationId,
        onSuccess,
    );
    const { tabs, selectedTabId, setSelectedTabId } = useUserDialogTabs(
        grantedWorkspaces,
        grantedUserGroups,
        isCurrentlyAdmin,
    );
    const {
        isConfirmDeleteOpened,
        onOpenDeleteDialog,
        onCloseDeleteDialog,
        dialogOverlayClassNames,
        dialogWrapperClassNames,
    } = useDeleteDialog();
    const deleteUser = useDeleteUser(userId, organizationId, onSuccess, onClose);
    const isBootstrapUser = useIsOrganizationBootstrapUser(organizationId, user);

    const { editButtonText, editButtonMode, editButtonIconClassName } = useMemo(() => {
        if (selectedTabId.id === userDialogTabsMessageLabels.workspaces.id) {
            return {
                editButtonMode: "WORKSPACE" as const,
                editButtonIconClassName: "gd-icon-add",
                editButtonText: intl.formatMessage(userManagementMessages.addWorkspaceButton),
            };
        }
        if (selectedTabId.id === userDialogTabsMessageLabels.userGroups.id) {
            return {
                editButtonMode: "USER_GROUPS" as const,
                editButtonIconClassName: "gd-icon-add",
                editButtonText: intl.formatMessage(userManagementMessages.addUserGroupButton),
            };
        }
        return {
            editButtonMode: "DETAIL" as const,
            editButtonIconClassName: "gd-icon-pencil gd-user-management-dialog-edit-mode-icon",
            editButtonText: intl.formatMessage(userManagementMessages.editUserButton),
        };
    }, [intl, selectedTabId]);

    const isLoaded = user !== undefined && grantedWorkspaces !== null && grantedUserGroups !== null;
    const isOpenedInEditMode = initialView !== "VIEW";

    return (
        <OrganizationIdProvider organizationId={organizationId}>
            {isConfirmDeleteOpened ? (
                <DeleteConfirmDialog
                    titleText={intl.formatMessage(userManagementMessages.deleteUserConfirmTitle)}
                    bodyText={intl.formatMessage(userManagementMessages.deleteUserConfirmBody)}
                    onConfirm={deleteUser}
                    onCancel={onCloseDeleteDialog}
                />
            ) : null}
            <Overlay
                alignPoints={alignPoints}
                isModal={true}
                positionType="fixed"
                className={dialogOverlayClassNames}
            >
                {!isLoaded && <LoadingComponent className="gd-user-management-dialog-loading" />}
                <div className={dialogWrapperClassNames}>
                    {dialogMode === "VIEW" && (
                        <ViewDialog
                            dialogTitle={extractUserName(user)}
                            isAdmin={isCurrentlyAdmin}
                            isDeleteLinkEnabled={!isBootstrapUser}
                            deleteLinkDisabledTooltipTextId={
                                userManagementMessages.deleteUserDisabledTooltip.id
                            }
                            deleteLinkText={intl.formatMessage(userManagementMessages.deleteUserLink)}
                            onOpenDeleteDialog={onOpenDeleteDialog}
                            onClose={onClose}
                            onEdit={() => setDialogMode(editButtonMode)}
                            editButtonText={editButtonText}
                            editButtonIconClassName={editButtonIconClassName}
                        >
                            {isCurrentlyAdmin ? (
                                <div className="gd-message progress gd-user-management-admin-alert s-admin-message">
                                    <div className="gd-message-text">
                                        {intl.formatMessage(userManagementMessages.adminAlert)}
                                    </div>
                                </div>
                            ) : null}
                            <Tabs
                                selectedTabId={selectedTabId.id}
                                onTabSelect={setSelectedTabId}
                                tabs={tabs}
                                className="gd-user-management-dialog-tabs s-user-management-tabs"
                            />
                            {selectedTabId.id === userDialogTabsMessageLabels.workspaces.id && (
                                <WorkspaceList
                                    workspaces={grantedWorkspaces}
                                    subjectType="user"
                                    mode="VIEW"
                                    onDelete={removeGrantedWorkspace}
                                    onChange={updateGrantedWorkspace}
                                />
                            )}
                            {selectedTabId.id === userDialogTabsMessageLabels.userGroups.id && (
                                <UserGroupsList
                                    userGroups={grantedUserGroups}
                                    mode="VIEW"
                                    onDelete={removeGrantedUserGroup}
                                />
                            )}
                            {selectedTabId.id === userDialogTabsMessageLabels.details.id && (
                                <UserDetailsView
                                    user={user}
                                    isAdmin={isCurrentlyAdmin}
                                    isBootstrapUser={isBootstrapUser}
                                    mode="VIEW"
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
                            onSubmit={onWorkspacesChanged}
                            onCancel={isOpenedInEditMode ? onClose : () => setDialogMode("VIEW")}
                            onClose={onClose}
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
                    {dialogMode === "DETAIL" && (
                        <EditUserDetails
                            user={user}
                            isAdmin={isCurrentlyAdmin}
                            isBootstrapUser={isBootstrapUser}
                            enableBackButton={!isOpenedInEditMode}
                            changeUserMembership={changeUserMembership}
                            onSubmit={onUserDetailsChanged}
                            onCancel={isOpenedInEditMode ? onClose : () => setDialogMode("VIEW")}
                            onClose={onClose}
                        />
                    )}
                </div>
            </Overlay>
        </OrganizationIdProvider>
    );
};
