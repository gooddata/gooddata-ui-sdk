// (C) 2023 GoodData Corporation

import { useState, useEffect, useMemo, useCallback } from "react";
import { useBackendStrict } from "@gooddata/sdk-ui";
import {
    IOrganizationDescriptor,
    IUser,
    IUserGroup,
    areObjRefsEqual,
    objRefToString,
} from "@gooddata/sdk-model";
import cx from "classnames";
import { useToastMessage, ITab } from "@gooddata/sdk-ui-kit";

import { userDialogTabsMessages, messages, userGroupDialogTabsMessages } from "./locales.js";

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
    UserEditDialogMode,
    IUserMember,
    WorkspacePermissionSubject,
    UserGroupEditDialogMode,
} from "./types.js";

export const useUser = (userId: string, organizationId: string, isAdmin: boolean, onSuccess: () => void) => {
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

    const onUserDetailsChanged = (user: IUser, isAdmin: boolean) => {
        setUser(user);
        setIsAdmin(isAdmin);
        onSuccess();
    };

    return {
        user,
        onUserDetailsChanged,
        isCurrentlyAdmin,
        setIsAdmin,
    };
};

export const useUserGroup = (userGroupId: string, organizationId: string, onSuccess: () => void) => {
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

    const onUserGroupDetailsChanged = (userGroup: IUserGroup) => {
        setUserGroup(userGroup);
        onSuccess();
    };

    return {
        userGroup,
        onUserGroupDetailsChanged,
    };
};

export const useDeleteUser = (
    userId: string,
    organizationId: string,
    onSuccess: () => void,
    onClose: () => void,
) => {
    const backend = useBackendStrict();
    const { addSuccess, addError } = useToastMessage();
    const [isProcessing, setIsProcessing] = useState(false);

    const deleteUser = useCallback(() => {
        setIsProcessing(true);
        backend
            .organization(organizationId)
            .users()
            .deleteUsers([userId])
            .then(() => {
                addSuccess(messages.userDeleteSuccess);
                onSuccess();
                onClose();
            })
            .catch((error) => {
                console.error("Delete of user failed", error);
                addError(messages.userDeletedFailure);
            })
            .finally(() => setIsProcessing(false));
    }, [backend, organizationId, userId, onSuccess, onClose, addSuccess, addError]);

    return {
        isDeleteUserProcessing: isProcessing,
        deleteUser,
    };
};

export const useDeleteUserGroup = (
    userGroupId: string,
    organizationId: string,
    onSuccess: () => void,
    onClose: () => void,
) => {
    const backend = useBackendStrict();
    const { addSuccess, addError } = useToastMessage();
    const [isProcessing, setIsProcessing] = useState(false);

    const deleteUserGroup = useCallback(() => {
        setIsProcessing(true);
        backend
            .organization(organizationId)
            .users()
            .deleteUserGroups([userGroupId])
            .then(() => {
                addSuccess(messages.userGroupDeleteSuccess);
                onSuccess();
                onClose();
            })
            .catch((error) => {
                console.error("Delete of user group failed", error);
                addError(messages.userGroupDeleteFailure);
            })
            .finally(() => setIsProcessing(false));
    }, [backend, organizationId, userGroupId, addError, addSuccess, onSuccess, onClose]);

    return {
        isDeleteUserGroupProcessing: isProcessing,
        deleteUserGroup,
    };
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
    onSuccess: () => void,
) => {
    const { addSuccess, addError } = useToastMessage();
    const backend = useBackendStrict();
    const [grantedWorkspaces, setGrantedWorkspaces] = useState<IGrantedWorkspace[]>(undefined);

    // setup API factories based on the subject we are working with
    const { getWorkspacePermissions } = useMemo(() => {
        if (subjectType === "user") {
            return {
                getWorkspacePermissions: backend.organization(organizationId).permissions()
                    .getWorkspacePermissionsForUser,
            };
        }
        return {
            getWorkspacePermissions: backend.organization(organizationId).permissions()
                .getWorkspacePermissionsForUserGroup,
        };
    }, [backend, organizationId, subjectType]);

    // load initial workspaces
    useEffect(() => {
        getWorkspacePermissions(id).then((assignments) => {
            const workspaces = assignments.map((assignment) => {
                const { workspace, permissions, hierarchyPermissions } = assignment;
                const permission = asPermission(
                    hierarchyPermissions.length > 0 ? hierarchyPermissions : permissions,
                );
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

    const removeGrantedWorkspace = (removedWorkspace: IGrantedWorkspace) => {
        const payload = grantedWorkspaces.map((workspace) =>
            workspace.id === removedWorkspace.id
                ? asEmptyPermissionAssignment(id, subjectType, removedWorkspace)
                : asPermissionAssignment(id, subjectType, workspace),
        );
        backend
            .organization(organizationId)
            .permissions()
            .updateWorkspacePermissions(payload)
            .then(() => {
                addSuccess(messages.workspaceRemovedSuccess);
                setGrantedWorkspaces(grantedWorkspaces.filter((item) => item.id !== removedWorkspace.id));
                onSuccess();
            })
            .catch((error) => {
                console.error("Removal of workspace permission failed", error);
                addError(messages.workspaceRemovedFailure);
            });
    };

    const updateGrantedWorkspace = (workspace: IGrantedWorkspace) => {
        const updatedWorkspaces = [
            ...grantedWorkspaces.filter((item) => item.id !== workspace.id),
            workspace,
        ].sort(sortByName);

        backend
            .organization(organizationId)
            .permissions()
            .updateWorkspacePermissions(
                updatedWorkspaces.map((workspace) => asPermissionAssignment(id, subjectType, workspace)),
            )
            .then(() => {
                addSuccess(messages.workspaceChangeSuccess);
                setGrantedWorkspaces(updatedWorkspaces);
            })
            .catch((error) => {
                console.error("Change of workspace permission failed", error);
                addError(messages.workspaceChangeFailure);
            });
    };

    // update internal array with workspaces after applied changed in workspaces edit mode
    const onWorkspacesChanged = (workspaces: IGrantedWorkspace[]) => {
        const unchangedWorkspaces = grantedWorkspaces.filter(
            (item) => !workspaces.some((w) => w.id === item.id),
        );
        setGrantedWorkspaces([...unchangedWorkspaces, ...workspaces].sort(sortByName));
        onSuccess();
    };

    return {
        grantedWorkspaces,
        onWorkspacesChanged,
        removeGrantedWorkspace,
        updateGrantedWorkspace,
    };
};

export const useUserGroups = (
    userId: string,
    organizationId: string,
    bootstrapUserGroupId: string,
    onSuccess: () => void,
    setIsAdmin: (isAdmin: boolean) => void,
) => {
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
            .removeUsersFromUserGroups([userId], [grantedUserGroup.id])
            .then(() => {
                addSuccess(messages.userGroupRemovedSuccess);
                setGrantedUserGroups(grantedUserGroups.filter((item) => item.id !== grantedUserGroup.id));
                onSuccess();
            })
            .catch((error) => {
                console.error("Removal of user group failed", error);
                addError(messages.userGroupRemoveFailure);
            });
    };

    const hasBootstrapUserGroup = (userGroups: IGrantedUserGroup[]) =>
        userGroups.some((group) => group.id === bootstrapUserGroupId);

    // removes admin group from the user if he is its member, update internal array of groups
    const removeAdminGroup = () => {
        hasBootstrapUserGroup(grantedUserGroups)
            ? backend
                  .organization(organizationId)
                  .users()
                  .removeUsersFromUserGroups([userId], [bootstrapUserGroupId])
                  .then(() =>
                      setGrantedUserGroups(
                          grantedUserGroups.filter((item) => item.id !== bootstrapUserGroupId),
                      ),
                  )
            : Promise.resolve();
    };

    // update internal array with user groups after applied changed in groups edit mode
    const onUserGroupsChanged = (userGroups: IGrantedUserGroup[]) => {
        const unchangedUserGroups = grantedUserGroups.filter(
            (item) => !userGroups.some((userGroup) => userGroup.id === item.id),
        );
        const newUserGroups = [...unchangedUserGroups, ...userGroups].sort(sortByName);
        setGrantedUserGroups(newUserGroups);
        if (hasBootstrapUserGroup(newUserGroups)) {
            setIsAdmin(true);
        }
        onSuccess();
    };

    return {
        grantedUserGroups,
        onUserGroupsChanged,
        removeGrantedUserGroup,
        removeAdminGroup,
    };
};

export const useUsers = (userGroupId: string, organizationId: string, onSuccess: () => void) => {
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
            .removeUsersFromUserGroups([grantedUser.id], [userGroupId])
            .then(() => {
                addSuccess(messages.usersRemovedSuccess);
                setGrantedUsers(grantedUsers.filter((item) => item.id !== grantedUser.id));
                onSuccess();
            })
            .catch((error) => {
                console.error("Removal of user failed", error);
                addError(messages.usersRemovedFailure);
            });
    };

    // update internal array with users after applied changed in user groups edit mode
    const onUsersChanged = (users: IUserMember[]) => {
        const unchangedUsers = grantedUsers.filter((item) => !users.some((g) => g.id === item.id));
        setGrantedUsers([...unchangedUsers, ...users].sort(sortByName));
        onSuccess();
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
        isAdmin ? userDialogTabsMessages.userGroups : userDialogTabsMessages.workspaces,
    );

    const tabs = useMemo<ITab[]>(() => {
        return [
            isAdmin
                ? undefined
                : {
                      id: userDialogTabsMessages.workspaces.id,
                      values: { count: grantedWorkspaces?.length },
                  },
            {
                id: userDialogTabsMessages.userGroups.id,
                values: { count: grantedUserGroups?.length },
            },
            userDialogTabsMessages.details,
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
    const [selectedTabId, setSelectedTabId] = useState(userGroupDialogTabsMessages.users);

    const tabs = useMemo<ITab[]>(() => {
        return [
            {
                id: userGroupDialogTabsMessages.users.id,
                values: { count: grantedUsers?.length },
            },
            isAdmin
                ? undefined
                : {
                      id: userGroupDialogTabsMessages.workspaces.id,
                      values: { count: grantedWorkspaces?.length },
                  },
            userGroupDialogTabsMessages.details,
        ].filter((tab) => !!tab);
    }, [isAdmin, grantedWorkspaces, grantedUsers]);

    return {
        tabs,
        selectedTabId,
        setSelectedTabId,
    };
};

export const useUserDialogMode = (initialView: UserEditDialogMode) => {
    const [dialogMode, setDialogMode] = useState<UserEditDialogMode>(initialView);
    return {
        dialogMode,
        setDialogMode,
    };
};

export const useUserGroupDialogMode = (initialView: UserGroupEditDialogMode) => {
    const [dialogMode, setDialogMode] = useState<UserGroupEditDialogMode>(initialView);
    return {
        dialogMode,
        setDialogMode,
    };
};

const useOrganization = (organizationId: string) => {
    const backend = useBackendStrict();
    const [organization, setOrganization] = useState<IOrganizationDescriptor>();

    // initial load of organization details
    useEffect(() => {
        backend
            .organization(organizationId)
            .getDescriptor(true)
            .then((organization) => {
                setOrganization(organization);
            });
    }, [backend, organizationId]);

    return {
        bootstrapUser: organization?.bootstrapUser,
        bootstrapUserGroup: organization?.bootstrapUserGroup,
    };
};

export const useOrganizationDetails = (organizationId: string) => {
    const { bootstrapUser, bootstrapUserGroup } = useOrganization(organizationId);
    return {
        isBootstrapUser: (user: IUser) => areObjRefsEqual(bootstrapUser, user?.ref),
        isBootstrapUserGroup: (userGroup: IUserGroup) => areObjRefsEqual(bootstrapUserGroup, userGroup?.ref),
        bootstrapUserId: bootstrapUser ? objRefToString(bootstrapUser) : undefined,
        bootstrapUserGroupId: bootstrapUserGroup ? objRefToString(bootstrapUserGroup) : undefined,
    };
};
