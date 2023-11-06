// (C) 2023 GoodData Corporation

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { LoadingComponent } from "@gooddata/sdk-ui";

import { Tabs } from "../../Tabs/index.js";
import { userGroupDialogTabsMessageLabels, userManagementMessages } from "../../locales.js";
import { Overlay } from "../../Overlay/index.js";
import { IAlignPoint } from "../../typings/positioning.js";

import { WorkspaceList } from "./Workspace/WorkspaceList.js";
import { AddWorkspace } from "./Workspace/AddWorkspace.js";
import {
    useWorkspaces,
    useDialogMode,
    useDeleteDialog,
    useUserGroup,
    useUsers,
    useDeleteUserGroup,
    useUserGroupDialogTabs,
} from "./dialogHooks.js";
import { ViewDialog } from "./ViewDialog.js";
import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";
import { OrganizationIdProvider } from "./OrganizationIdContext.js";
import { AddUser } from "./Users/AddUser.js";
import { EditUserGroupDetails } from "./Details/EditUserGroupDetails.js";
import { UserGroupDetailsView } from "./Details/UserGroupDetailsView.js";
import { UsersList } from "./Users/UsersList.js";
import { extractUserGroupName } from "./utils.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export interface IUserGroupEditDialogProps {
    userGroupId: string;
    organizationId: string;
    isAdmin: boolean;
    onUserGroupChanged: () => void;
    onClose: () => void;
}

/**
 * @internal
 */
export const UserGroupEditDialog: React.FC<IUserGroupEditDialogProps> = ({
    userGroupId,
    organizationId,
    isAdmin,
    onUserGroupChanged,
    onClose,
}) => {
    const intl = useIntl();
    const { dialogMode, setDialogMode } = useDialogMode();
    const { userGroup, onUserGroupDetailsChanged } = useUserGroup(userGroupId, organizationId, onUserGroupChanged);
    const { grantedWorkspaces, onWorkspacesChanged, removeGrantedWorkspace, updateGrantedWorkspace } =
        useWorkspaces(userGroupId, "userGroup", organizationId, onUserGroupChanged);
    const { grantedUsers, onUsersChanged, removeGrantedUsers } = useUsers(userGroupId, organizationId, onUserGroupChanged);
    const { tabs, selectedTabId, setSelectedTabId } = useUserGroupDialogTabs(
        grantedWorkspaces,
        grantedUsers,
        isAdmin,
    );
    const {
        isConfirmDeleteOpened,
        onOpenDeleteDialog,
        onCloseDeleteDialog,
        dialogOverlayClassNames,
        dialogWrapperClassNames,
    } = useDeleteDialog();
    const deleteUserGroup = useDeleteUserGroup(userGroupId, organizationId, onUserGroupChanged, onClose);

    const { editButtonText, editButtonMode, editButtonIconClassName } = useMemo(() => {
        if (selectedTabId.id === userGroupDialogTabsMessageLabels.workspaces.id) {
            return {
                editButtonMode: "WORKSPACE" as const,
                editButtonIconClassName: "gd-icon-add",
                editButtonText: intl.formatMessage(userManagementMessages.addWorkspaceButton),
            };
        }
        if (selectedTabId.id === userGroupDialogTabsMessageLabels.users.id) {
            return {
                editButtonMode: "USERS" as const,
                editButtonIconClassName: "gd-icon-add",
                editButtonText: intl.formatMessage(userManagementMessages.addUserButton),
            };
        }
        return {
            editButtonMode: "DETAIL" as const,
            editButtonIconClassName: "gd-icon-pencil gd-user-management-dialog-edit-mode-icon",
            editButtonText: intl.formatMessage(userManagementMessages.editUserGroupButton),
        };
    }, [intl, selectedTabId]);

    const isLoaded = userGroup !== undefined && grantedWorkspaces !== undefined && grantedUsers !== null;

    return (
        <OrganizationIdProvider organizationId={organizationId}>
            {isConfirmDeleteOpened ? (
                <DeleteConfirmDialog
                    titleText={extractUserGroupName(userGroup)}
                    bodyText={intl.formatMessage(userManagementMessages.deleteUserGroupConfirmBody, {
                        br: <br />,
                    })}
                    onConfirm={deleteUserGroup}
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
                            dialogTitle={extractUserGroupName(userGroup)}
                            isAdmin={isAdmin}
                            deleteLinkText={intl.formatMessage(userManagementMessages.deleteUserGroupLink)}
                            onOpenDeleteDialog={onOpenDeleteDialog}
                            onClose={onClose}
                            onEdit={() => setDialogMode(editButtonMode)}
                            editButtonText={editButtonText}
                            editButtonIconClassName={editButtonIconClassName}
                        >
                            <Tabs
                                selectedTabId={selectedTabId.id}
                                onTabSelect={setSelectedTabId}
                                tabs={tabs}
                                className="gd-user-management-dialog-tabs s-user-management-tabs"
                            />
                            {selectedTabId.id === userGroupDialogTabsMessageLabels.workspaces.id && (
                                <WorkspaceList
                                    workspaces={grantedWorkspaces}
                                    mode="VIEW"
                                    onDelete={removeGrantedWorkspace}
                                    onChange={updateGrantedWorkspace}
                                />
                            )}
                            {selectedTabId.id === userGroupDialogTabsMessageLabels.users.id && (
                                <UsersList users={grantedUsers} mode="VIEW" onDelete={removeGrantedUsers} />
                            )}
                            {selectedTabId.id === userGroupDialogTabsMessageLabels.details.id && (
                                <UserGroupDetailsView userGroup={userGroup} mode="VIEW" />
                            )}
                        </ViewDialog>
                    )}
                    {dialogMode === "WORKSPACE" && (
                        <AddWorkspace
                            id={userGroupId}
                            subjectType="userGroup"
                            grantedWorkspaces={grantedWorkspaces}
                            onSubmit={onWorkspacesChanged}
                            onCancel={() => setDialogMode("VIEW")}
                        />
                    )}
                    {dialogMode === "USERS" && (
                        <AddUser
                            userGroupId={userGroupId}
                            grantedUsers={grantedUsers}
                            onSubmit={onUsersChanged}
                            onCancel={() => setDialogMode("VIEW")}
                        />
                    )}
                    {dialogMode === "DETAIL" && (
                        <EditUserGroupDetails
                            userGroup={userGroup}
                            onSubmit={onUserGroupDetailsChanged}
                            onCancel={() => setDialogMode("VIEW")}
                        />
                    )}
                </div>
            </Overlay>
        </OrganizationIdProvider>
    );
};
