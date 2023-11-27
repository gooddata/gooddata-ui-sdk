// (C) 2023 GoodData Corporation

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { LoadingComponent } from "@gooddata/sdk-ui";
import { Tabs, Overlay, IAlignPoint } from "@gooddata/sdk-ui-kit";

import { userDialogTabsMessages, messages } from "./locales.js";
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
    useOrganizationDetails,
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
    const { user, isCurrentlyAdmin, onUserDetailsChanged, setIsAdmin } = useUser(
        userId,
        organizationId,
        isAdmin,
        onSuccess,
    );
    const { isBootstrapUser, bootstrapUserGroupId } = useOrganizationDetails(organizationId);
    const { grantedWorkspaces, onWorkspacesChanged, removeGrantedWorkspace, updateGrantedWorkspace } =
        useWorkspaces(userId, "user", organizationId, onSuccess);
    const { grantedUserGroups, onUserGroupsChanged, removeGrantedUserGroup, removeAdminGroup } =
        useUserGroups(userId, organizationId, bootstrapUserGroupId, onSuccess, setIsAdmin);
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
        return {
            editButtonMode: "DETAIL" as const,
            editButtonIconClassName: "gd-icon-pencil gd-user-management-dialog-edit-mode-icon",
            editButtonText: intl.formatMessage(messages.editUserButton),
        };
    }, [intl, selectedTabId]);

    const isLoaded = user !== undefined && grantedWorkspaces !== null && grantedUserGroups !== null;
    const isOpenedInEditMode = initialView !== "VIEW";

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
                                <div className="gd-message progress gd-user-management-admin-alert s-admin-message">
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
                            isBootstrapUser={isBootstrapUser(user)}
                            enableBackButton={!isOpenedInEditMode}
                            changeUserMembership={changeUserMembership}
                            onSubmit={onUserDetailsChanged}
                            onCancel={isOpenedInEditMode ? onClose : () => setDialogMode("VIEW")}
                            onClose={onClose}
                            removeAdminGroup={removeAdminGroup}
                        />
                    )}
                </div>
            </Overlay>
        </OrganizationIdProvider>
    );
};
