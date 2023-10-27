// (C) 2023 GoodData Corporation

import { useState, useEffect, useMemo } from "react";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { IUser, IUserGroup } from "@gooddata/sdk-model";
import cx from "classnames";

import { useToastMessage } from "../../Messages/index.js";
import {
    userDialogTabsMessageLabels,
    userManagementMessages,
    userGroupDialogTabsMessageLabels,
} from "../../locales.js";
import { ITab } from "../../Tabs/index.js";

import {
    asPermission,
    asEmptyPermissionAssignment,
    sortByName,
    asPermissionAssignment,
    extractUserGroupName,
    extractUserName,
} from "./utils.js";
import {
    IGrantedWorkspace,
    IGrantedUserGroup,
    DialogMode,
    IUserMember,
    WorkspacePermissionSubject,
} from "./types.js";

export const useUser = (userId: string, organizationId: string, isAdmin: boolean) => {
    const [user, setUser] = useState<IUser>();
    const [isCurrentlyAdmin, setIsAdmin] = useState(isAdmin);

    const backend = useBackendStrict();

    // initial user load
    useEffect(() => {
        backend
            .organization(organizationId)
            .users()
            .getUser(userId)
            .then((user) => setUser(user));
    }, [backend, userId, organizationId]);

    const onUserChanged = (user: IUser, isAdmin: boolean) => {
        setUser(user);
        setIsAdmin(isAdmin);
    };

    return {
        user,
        onUserChanged,
        isCurrentlyAdmin,
    };
};

export const useUserGroup = (userGroupId: string, organizationId: string) => {
    const [userGroup, setUserGroup] = useState<IUserGroup>();
    const backend = useBackendStrict();

    // initial user group load
    useEffect(() => {
        backend
            .organization(organizationId)
            .users()
            .getUserGroup(userGroupId)
            .then((userGroup) => setUserGroup(userGroup));
    }, [backend, userGroupId, organizationId]);

    return {
        userGroup,
        onUserGroupChanged: setUserGroup,
    };
};

export const useDeleteUser = (userId: string, organizationId: string, onClose: () => void) => {
    const backend = useBackendStrict();
    const { addSuccess, addError } = useToastMessage();

    return () =>
        backend
            .organization(organizationId)
            .users()
            .deleteUser(userId)
            .then(() => {
                addSuccess(userManagementMessages.userDeleteSuccess);
                onClose();
            })
            .catch((error) => {
                console.error("Delete of user failed", error);
                addError(userManagementMessages.userDeletedFailure);
            });
};

export const useDeleteUserGroup = (userGroupId: string, organizationId: string, onClose: () => void) => {
    const backend = useBackendStrict();
    const { addSuccess, addError } = useToastMessage();

    return () =>
        backend
            .organization(organizationId)
            .users()
            .deleteUserGroup(userGroupId)
            .then(() => {
                addSuccess(userManagementMessages.userGroupDeleteSuccess);
                onClose();
            })
            .catch((error) => {
                console.error("Delete of user group failed", error);
                addError(userManagementMessages.userGroupDeleteFailure);
            });
};

export const useDeleteDialog = () => {
    const [isConfirmDeleteOpened, setConfirmDeleteOpened] = useState(false);

    const dialogOverlayClassNames = cx("gd-user-management-dialog", {
        "gd-user-management-dialog-hidden": isConfirmDeleteOpened,
    });
    const dialogWrapperClassNames = cx("gd-user-management-dialog", {
        "gd-user-management-dialog-hidden": isConfirmDeleteOpened,
    });

    return {
        isConfirmDeleteOpened,
        onOpenDeleteDialog: () => setConfirmDeleteOpened(true),
        onCloseDeleteDialog: () => setConfirmDeleteOpened(false),
        dialogOverlayClassNames,
        dialogWrapperClassNames,
    };
};

export const useWorkspaces = (
    id: string,
    subjectType: WorkspacePermissionSubject,
    organizationId: string,
) => {
    const { addSuccess, addError } = useToastMessage();
    const backend = useBackendStrict();
    const [grantedWorkspaces, setGrantedWorkspaces] = useState<IGrantedWorkspace[]>(undefined);

    // setup API factories based on the subject we are working with
    const { getWorkspacePermissions, updateWorkspacePermissions } = useMemo(() => {
        if (subjectType === "user") {
            return {
                getWorkspacePermissions: backend.organization(organizationId).permissions()
                    .getWorkspacePermissionsForUser,
                updateWorkspacePermissions: backend.organization(organizationId).permissions()
                    .updateWorkspacePermissionsForUser,
            };
        }
        return {
            getWorkspacePermissions: backend.organization(organizationId).permissions()
                .getWorkspacePermissionsForUserGroup,
            updateWorkspacePermissions: backend.organization(organizationId).permissions()
                .updateWorkspacePermissionsForUserGroup,
        };
    }, [backend, organizationId, subjectType]);

    // load initial workspaces
    useEffect(() => {
        getWorkspacePermissions(id).then((assignments) => {
            const workspaces = assignments.map((assignment) => {
                const { workspace, permissions, hierarchyPermissions } = assignment;
                const permission = asPermission(hierarchyPermissions.length ? hierarchyPermissions : permissions);
                return {
                    id: workspace.id,
                    title: workspace.name,
                    permission,
                    isHierarchical: hierarchyPermissions.length > 0,
                };
            });
            setGrantedWorkspaces(workspaces);
        });
    }, [getWorkspacePermissions, id, organizationId]);

    const removeGrantedWorkspace = (workspace: IGrantedWorkspace) => {
        updateWorkspacePermissions(id, [asEmptyPermissionAssignment(workspace)])
            .then(() => {
                addSuccess(userManagementMessages.workspaceRemovedSuccess);
                setGrantedWorkspaces(grantedWorkspaces.filter((item) => item.id !== workspace.id));
            })
            .catch((error) => {
                console.error("Removal of workspace permission failed", error);
                addError(userManagementMessages.workspaceRemovedFailure);
            });
    };

    const updateGrantedWorkspace = (workspace: IGrantedWorkspace) => {
        updateWorkspacePermissions(id, [asPermissionAssignment(workspace)])
            .then(() => {
                addSuccess(userManagementMessages.workspaceChangeSuccess);
                setGrantedWorkspaces(
                    [...grantedWorkspaces.filter((item) => item.id !== workspace.id), workspace].sort(
                        sortByName,
                    ),
                );
            })
            .catch((error) => {
                console.error("Change of workspace permission failed", error);
                addError(userManagementMessages.workspaceChangeFailure);
            });
    };

    // update internal array with workspaces after applied changed in workspaces edit mode
    const onWorkspacesChanged = (workspaces: IGrantedWorkspace[]) => {
        const unchangedWorkspaces = grantedWorkspaces.filter(
            (item) => !workspaces.some((w) => w.id === item.id),
        );
        setGrantedWorkspaces([...unchangedWorkspaces, ...workspaces].sort(sortByName));
    };

    return {
        grantedWorkspaces,
        onWorkspacesChanged,
        removeGrantedWorkspace,
        updateGrantedWorkspace,
    };
};

export const useUserGroups = (userId: string, organizationId: string) => {
    const { addSuccess, addError } = useToastMessage();
    const backend = useBackendStrict();
    const [grantedUserGroups, setGrantedUserGroups] = useState<IGrantedUserGroup[]>(undefined);

    // load initial user groups
    useEffect(() => {
        backend
            .organization(organizationId)
            .users()
            .getUserGroupsOfUser(userId)
            .then((userGroups) => {
                setGrantedUserGroups(
                    userGroups.map((userGroup) => ({
                        id: userGroup.id,
                        title: extractUserGroupName(userGroup),
                    })),
                );
            });
    }, [backend, userId, organizationId]);

    const removeGrantedUserGroup = (grantedUserGroup: IGrantedUserGroup) => {
        backend
            .organization(organizationId)
            .users()
            .removeUserFromUserGroup(userId, grantedUserGroup.id)
            .then(() => {
                addSuccess(userManagementMessages.userGroupRemovedSuccess);
                setGrantedUserGroups(grantedUserGroups.filter((item) => item.id !== grantedUserGroup.id));
            })
            .catch((error) => {
                console.error("Removal of user group failed", error);
                addError(userManagementMessages.userGroupRemoveFailure);
            });
    };

    // update internal array with user groups after applied changed in groups edit mode
    const onUserGroupsChanged = (userGroups: IGrantedUserGroup[]) => {
        const unchangedUserGroups = grantedUserGroups.filter(
            (item) => !userGroups.some((userGroup) => userGroup.id === item.id),
        );
        setGrantedUserGroups([...unchangedUserGroups, ...userGroups].sort(sortByName));
    };

    return {
        grantedUserGroups,
        onUserGroupsChanged,
        removeGrantedUserGroup,
    };
};

export const useUsers = (userGroupId: string, organizationId: string) => {
    const { addSuccess, addError } = useToastMessage();
    const backend = useBackendStrict();
    const [grantedUsers, setGrantedUsers] = useState<IUserMember[]>(undefined);

    // load initial users
    useEffect(() => {
        backend
            .organization(organizationId)
            .users()
            .getUsersOfUserGroup(userGroupId)
            .then((users) => {
                setGrantedUsers(
                    users.map((user) => ({
                        id: user.login,
                        title: extractUserName(user),
                        email: user.email,
                    })),
                );
            });
    }, [backend, userGroupId, organizationId]);

    const removeGrantedUsers = (grantedUser: IUserMember) => {
        backend
            .organization(organizationId)
            .users()
            .removeUserFromUserGroup(grantedUser.id, userGroupId)
            .then(() => {
                addSuccess(userManagementMessages.usersRemovedSuccess);
                setGrantedUsers(grantedUsers.filter((item) => item.id !== grantedUser.id));
            })
            .catch((error) => {
                console.error("Removal of user failed", error);
                addError(userManagementMessages.usersRemovedFailure);
            });
    };

    // update internal array with users after applied changed in user groups edit mode
    const onUsersChanged = (users: IUserMember[]) => {
        const unchangedUsers = grantedUsers.filter((item) => !users.some((g) => g.id === item.id));
        setGrantedUsers([...unchangedUsers, ...users].sort(sortByName));
    };

    return {
        grantedUsers,
        onUsersChanged,
        removeGrantedUsers,
    };
};

export const useUserDialogTabs = (
    grantedWorkspaces: IGrantedWorkspace[],
    grantedUserGroups: IGrantedUserGroup[],
    isAdmin: boolean,
) => {
    const [selectedTabId, setSelectedTabId] = useState(
        isAdmin ? userDialogTabsMessageLabels.userGroups : userDialogTabsMessageLabels.workspaces,
    );

    const tabs = useMemo<ITab[]>(() => {
        return [
            isAdmin
                ? undefined
                : {
                      id: userDialogTabsMessageLabels.workspaces.id,
                      values: { count: grantedWorkspaces?.length },
                  },
            {
                id: userDialogTabsMessageLabels.userGroups.id,
                values: { count: grantedUserGroups?.length },
            },
            userDialogTabsMessageLabels.details,
        ].filter((tab) => !!tab);
    }, [isAdmin, grantedWorkspaces, grantedUserGroups]);

    return {
        tabs,
        selectedTabId,
        setSelectedTabId,
    };
};

export const useUserGroupDialogTabs = (
    grantedWorkspaces: IGrantedWorkspace[],
    grantedUsers: IUserMember[],
    isAdmin: boolean,
) => {
    const [selectedTabId, setSelectedTabId] = useState(
        userGroupDialogTabsMessageLabels.users,
    );

    const tabs = useMemo<ITab[]>(() => {
        return [
            {
                id: userGroupDialogTabsMessageLabels.users.id,
                values: { count: grantedUsers?.length },
            },
            isAdmin
                ? undefined
                : {
                      id: userGroupDialogTabsMessageLabels.workspaces.id,
                      values: { count: grantedWorkspaces?.length },
                  },
            userGroupDialogTabsMessageLabels.details,
        ].filter((tab) => !!tab);
    }, [isAdmin, grantedWorkspaces, grantedUsers]);

    return {
        tabs,
        selectedTabId,
        setSelectedTabId,
    };
};

export const useDialogMode = () => {
    const [dialogMode, setDialogMode] = useState<DialogMode>("VIEW");
    return {
        dialogMode,
        setDialogMode,
    };
};
