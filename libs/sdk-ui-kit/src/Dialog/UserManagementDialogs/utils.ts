// (C) 2023 GoodData Corporation

import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";
import {
    IWorkspacePermissionAssignment,
    AssignedWorkspacePermission,
    IOrganizationUser,
    IOrganizationUserGroup,
    IUser,
    isIOrganizationUser,
    IUserGroup,
} from "@gooddata/sdk-model";

import { IGrantedWorkspace, WorkspacePermission, IGrantedUserGroup, IUserMember } from "./types.js";

export interface IComparableItemWithTitle {
    title: string;
}

export const sortByName = (itemA: IComparableItemWithTitle, itemB: IComparableItemWithTitle): number => {
    const textA = itemA.title.toUpperCase();
    const textB = itemB.title.toUpperCase();
    return textA.localeCompare(textB);
};

export const getWorkspaceItemTestId = (workspace: IWorkspaceDescriptor): string => {
    return `s-workspace-item-id-${workspace.id}`;
};

export const getUserGroupItemTestId = (userGroup: IGrantedUserGroup): string => {
    return `s-user-group-item-id-${userGroup.id}`;
};
export const getUserItemTestId = (user: IUserMember): string => {
    return `s-user-item-id-${user.id}`;
};

const asPermissions = (permission: WorkspacePermission): AssignedWorkspacePermission[] => {
    switch (permission) {
        case "VIEW":
            return ["VIEW"];
        case "VIEW_AND_EXPORT":
            return ["VIEW", "EXPORT"];
        case "ANALYZE":
            return ["ANALYZE"];
        case "ANALYZE_AND_EXPORT":
            return ["ANALYZE", "EXPORT"];
        case "MANAGE":
            return ["MANAGE"];
        default:
            throw Error("Unsupported permission value");
    }
};

export const asPermission = (permissions: AssignedWorkspacePermission[]): WorkspacePermission => {
    if (permissions.includes("MANAGE")) {
        return "MANAGE";
    }
    if (permissions.includes("ANALYZE")) {
        return permissions.includes("EXPORT") ? "ANALYZE_AND_EXPORT" : "ANALYZE"; // TODO what about EXPORT_PDF granularity?
    }
    if (permissions.includes("VIEW")) {
        return permissions.includes("EXPORT") ? "VIEW_AND_EXPORT" : "VIEW";
    }
    return "VIEW";
};

export const asEmptyPermissionAssignment = (workspace: IGrantedWorkspace): IWorkspacePermissionAssignment => {
    return {
        workspace: {
            id: workspace.id,
        },
        permissions: [],
        hierarchyPermissions: [],
    };
};

export const asPermissionAssignment = (workspace: IGrantedWorkspace): IWorkspacePermissionAssignment => {
    const permissions = asPermissions(workspace.permission);
    return {
        workspace: {
            id: workspace.id,
        },
        permissions: workspace.isHierarchical ? [] : permissions,
        hierarchyPermissions: workspace.isHierarchical ? permissions : [],
    };
};

export const extractUserName = (user?: IOrganizationUser | IUser): string | undefined => {
    if (!user) {
        return undefined;
    }
    if (isIOrganizationUser(user)) {
        return user.fullName || user.email || user.id;
    }
    return user.fullName || user.email || user.login; // do not use ?? as for example empty email is set to ""
};

export const extractUserGroupName = (userGroup: IOrganizationUserGroup | IUserGroup): string | undefined => {
    return userGroup?.name || userGroup?.id;
};
