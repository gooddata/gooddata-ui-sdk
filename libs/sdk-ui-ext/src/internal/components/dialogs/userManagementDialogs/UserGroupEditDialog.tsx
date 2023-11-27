// (C) 2023 GoodData Corporation

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { LoadingComponent } from "@gooddata/sdk-ui";
import { Tabs, Overlay, IAlignPoint } from "@gooddata/sdk-ui-kit";

import { userGroupDialogTabsMessages, messages } from "./locales.js";
import { WorkspaceList } from "./Workspace/WorkspaceList.js";
import { AddWorkspace } from "./Workspace/AddWorkspace.js";
import {
    useWorkspaces,
    useDeleteDialog,
    useUserGroup,
    useUsers,
    useDeleteUserGroup,
    useUserGroupDialogTabs,
    useUserGroupDialogMode,
    useOrganizationDetails,
} from "./dialogHooks.js";
import { ViewDialog } from "./ViewDialog.js";
import { DeleteConfirmDialog } from "./ConfirmDialogs/DeleteConfirmDialog.js";
import { OrganizationIdProvider } from "./OrganizationIdContext.js";
import { AddUser } from "./Users/AddUser.js";
import { EditUserGroupDetails } from "./Details/EditUserGroupDetails.js";
import { UserGroupDetailsView } from "./Details/UserGroupDetailsView.js";
import { UsersList } from "./Users/UsersList.js";
import { extractUserGroupName } from "./utils.js";
import { UserGroupEditDialogMode } from "./types.js";

const alignPoints: IAlignPoint[] = [{ align: "cc cc" }];

/**
 * @internal
 */
export interface IUserGroupEditDialogProps {
    userGroupId: string;
    organizationId: string;
    isAdmin: boolean;
    initialView?: UserGroupEditDialogMode;
    onSuccess: () => void;
    onClose: () => void;
}

/**
 * @internal
 */
export const UserGroupEditDialog: React.FC<IUserGroupEditDialogProps> = ({
    userGroupId,
    organizationId,
    isAdmin,
    onSuccess,
    onClose,
    initialView = "VIEW",
}) => {
    const intl = useIntl();
    const { dialogMode, setDialogMode } = useUserGroupDialogMode(initialView);
    const { userGroup, onUserGroupDetailsChanged } = useUserGroup(userGroupId, organizationId, onSuccess);
    const { grantedWorkspaces, onWorkspacesChanged, removeGrantedWorkspace, updateGrantedWorkspace } =
        useWorkspaces(userGroupId, "userGroup", organizationId, onSuccess);
    const { grantedUsers, onUsersChanged, removeGrantedUsers } = useUsers(
        userGroupId,
        organizationId,
        onSuccess,
    );
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
    const { deleteUserGroup, isDeleteUserGroupProcessing } = useDeleteUserGroup(
        userGroupId,
        organizationId,
        onSuccess,
        onClose,
    );
    const { isBootstrapUserGroup } = useOrganizationDetails(organizationId);

    const { editButtonText, editButtonMode, editButtonIconClassName } = useMemo(() => {
        if (selectedTabId.id === userGroupDialogTabsMessages.workspaces.id) {
            return {
                editButtonMode: "WORKSPACE" as const,
                editButtonIconClassName: "gd-icon-add",
                editButtonText: intl.formatMessage(messages.addWorkspaceButton),
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

    const isLoaded = userGroup !== undefined && grantedWorkspaces !== undefined && grantedUsers !== null;
    const isOpenedInEditMode = initialView !== "VIEW";

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
            >
                {!isLoaded && <LoadingComponent className="gd-user-management-dialog-loading" />}
                <div className={dialogWrapperClassNames}>
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
                                <div className="gd-message progress gd-user-management-admin-alert s-admin-message">
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
                                />
                            )}
                            {selectedTabId.id === userGroupDialogTabsMessages.users.id && (
                                <UsersList users={grantedUsers} mode="VIEW" onDelete={removeGrantedUsers} />
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
                            onSubmit={onWorkspacesChanged}
                            onCancel={isOpenedInEditMode ? onClose : () => setDialogMode("VIEW")}
                            onClose={onClose}
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
                    {dialogMode === "DETAIL" && (
                        <EditUserGroupDetails
                            userGroup={userGroup}
                            enableBackButton={!isOpenedInEditMode}
                            onSubmit={onUserGroupDetailsChanged}
                            onCancel={isOpenedInEditMode ? onClose : () => setDialogMode("VIEW")}
                            onClose={onClose}
                        />
                    )}
                </div>
            </Overlay>
        </OrganizationIdProvider>
    );
};
