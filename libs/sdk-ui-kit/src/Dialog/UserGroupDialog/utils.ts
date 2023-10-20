// (C) 2023 GoodData Corporation

import {
    IWorkspaceDescriptor,
    WorkspacePermissionAssignment,
    WorkspacePermissionAssignmentHierarchyPermissionsEnum,
    WorkspacePermissionAssignmentPermissionsEnum
} from "@gooddata/sdk-backend-spi";

import { IGrantedWorkspace, WorkspacePermission, IGrantedGroup } from "./types.js";

/**
 * @internal
 */
export const sortWorkspacesByName = (workspaceA: IWorkspaceDescriptor, workspaceB: IWorkspaceDescriptor): number => {
    const textA = workspaceA.title.toUpperCase();
    const textB = workspaceB.title.toUpperCase();
    return textA.localeCompare(textB);
};

/**
 * @internal
 */
export const sortGrantedWorkspacesByName = (workspaceA: IGrantedWorkspace, workspaceB: IGrantedWorkspace): number => {
    const textA = workspaceA.title.toUpperCase();
    const textB = workspaceB.title.toUpperCase();
    return textA.localeCompare(textB);
};

/**
 * @internal
 */
export const sortGrantedGroupsByName = (groupA: IGrantedGroup, groupB: IGrantedGroup): number => {
    const textA = groupA.title.toUpperCase();
    const textB = groupB.title.toUpperCase();
    return textA.localeCompare(textB);
};

/**
 * @internal
 */
export const getWorkspaceItemTestId = (workspace: IWorkspaceDescriptor): string => {
    return `s-gd-workspace-item-id-${workspace.id}`;
};

/**
 * @internal
 */
export const getGroupItemTestId = (group: IGrantedGroup): string => {
    return `s-gd-group-item-id-${group.id}`;
};

const asPermissions = (permission: WorkspacePermission): WorkspacePermissionAssignmentPermissionsEnum[] => {
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

export const asPermission = (permissions: WorkspacePermissionAssignmentHierarchyPermissionsEnum[]): WorkspacePermission => {
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
}

export const asEmptyPermissionAssignment = (workspace: IGrantedWorkspace): WorkspacePermissionAssignment => {
    return {
        workspace: {
            id: workspace.id
        },
        permissions: [],
        hierarchyPermissions: [],
    };
};

export const asPermissionAssignment = (workspace: IGrantedWorkspace): WorkspacePermissionAssignment => {
    const permissions = asPermissions(workspace.permission);
    return {
        workspace: {
            id: workspace.id
        },
        permissions: workspace.isHierarchical ? [] : permissions,
        hierarchyPermissions: workspace.isHierarchical ? permissions : [],
    };
};
