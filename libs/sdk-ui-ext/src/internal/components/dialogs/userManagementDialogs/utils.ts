// (C) 2023-2025 GoodData Corporation
import { type IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";
import {
    type AssignedDataSourcePermission,
    type AssignedWorkspacePermission,
    type IDataSourceIdentifierDescriptor,
    type IDataSourcePermissionAssignment,
    type IOrganizationUser,
    type IOrganizationUserGroup,
    type IUser,
    type IUserGroup,
    type IWorkspacePermissionAssignment,
    isAssignedWorkspacePermission,
    isIOrganizationUser,
} from "@gooddata/sdk-model";

import {
    type DataSourcePermission,
    type DataSourcePermissionSubject,
    type IGrantedDataSource,
    type IGrantedUserGroup,
    type IGrantedWorkspace,
    type IUserMember,
    type WorkspacePermission,
    type WorkspacePermissionSubject,
    type WorkspacePermissions,
} from "./types.js";

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

export const getDataSourceItemTestId = (dataSource: IDataSourceIdentifierDescriptor): string => {
    return `s-data-source-item-id-${dataSource.id}`;
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
        case "VIEW_AND_SAVE_VIEWS":
            return ["VIEW", "CREATE_FILTER_VIEW"];
        case "VIEW_AND_EXPORT":
            return ["VIEW", "EXPORT"];
        case "VIEW_AND_EXPORT_AND_SAVE_VIEWS":
            return ["VIEW", "EXPORT", "CREATE_FILTER_VIEW"];
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

const asGranularPermissions = (permissions: WorkspacePermissions): AssignedWorkspacePermission[] => {
    return permissions.filter(isAssignedWorkspacePermission);
};

const asDataSourcePermissions = (permission: DataSourcePermission): AssignedDataSourcePermission[] => {
    switch (permission) {
        case "USE":
            return ["USE"];
        case "MANAGE":
            return ["MANAGE"];
        default:
            throw Error("Unsupported permission value");
    }
};

export const asDataSourcePermission = (permissions: AssignedDataSourcePermission[]): DataSourcePermission => {
    if (permissions.includes("MANAGE")) {
        return "MANAGE";
    }
    if (permissions.includes("USE")) {
        return "USE";
    }

    return "USE";
};

export const asPermission = (permissions: AssignedWorkspacePermission[]): WorkspacePermission => {
    if (permissions.includes("MANAGE")) {
        return "MANAGE";
    }
    if (permissions.includes("ANALYZE")) {
        return permissions.includes("EXPORT") ? "ANALYZE_AND_EXPORT" : "ANALYZE"; // TODO what about EXPORT_PDF granularity?
    }
    if (permissions.includes("VIEW")) {
        if (permissions.includes("CREATE_FILTER_VIEW")) {
            return permissions.includes("EXPORT") ? "VIEW_AND_EXPORT_AND_SAVE_VIEWS" : "VIEW_AND_SAVE_VIEWS";
        }
        return permissions.includes("EXPORT") ? "VIEW_AND_EXPORT" : "VIEW";
    }
    return "VIEW";
};

export const asEmptyDataSourcePermissionAssignment = (
    subjectId: string,
    subjectType: WorkspacePermissionSubject,
    dataSource: IGrantedDataSource,
): IDataSourcePermissionAssignment => {
    return {
        assigneeIdentifier: {
            id: subjectId,
            type: subjectType,
        },
        dataSource: {
            id: dataSource.id,
        },
        permissions: [],
    };
};

export const asEmptyPermissionAssignment = (
    subjectId: string,
    subjectType: WorkspacePermissionSubject,
    workspace: IGrantedWorkspace,
): IWorkspacePermissionAssignment => {
    return {
        assigneeIdentifier: {
            id: subjectId,
            type: subjectType,
        },
        workspace: {
            id: workspace.id,
        },
        permissions: [],
        hierarchyPermissions: [],
    };
};

export const asPermissionAssignment = (
    subjectId: string,
    subjectType: WorkspacePermissionSubject,
    workspace: IGrantedWorkspace,
): IWorkspacePermissionAssignment => {
    const permissions = asPermissions(workspace.permissions[0]);
    return {
        assigneeIdentifier: {
            id: subjectId,
            type: subjectType,
        },
        workspace: {
            id: workspace.id,
        },
        permissions: workspace.isHierarchical ? [] : permissions,
        hierarchyPermissions: workspace.isHierarchical ? permissions : [],
    };
};

export const asDataSourcePermissionAssignment = (
    subjectId: string,
    subjectType: DataSourcePermissionSubject,
    dataSource: IGrantedDataSource,
): IDataSourcePermissionAssignment => {
    const permissions = asDataSourcePermissions(dataSource.permission);
    return {
        assigneeIdentifier: {
            id: subjectId,
            type: subjectType,
        },
        dataSource: {
            id: dataSource.id,
        },
        permissions,
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

export const extractUserGroupName = (
    userGroup: IOrganizationUserGroup | IUserGroup | undefined,
): string | undefined => {
    return userGroup?.name || userGroup?.id;
};

export const grantedWorkspaceAsPermissionAssignment = (
    grantedWorkspace: IGrantedWorkspace,
): Omit<IWorkspacePermissionAssignment, "assigneeIdentifier"> => {
    const permissions = asGranularPermissions(grantedWorkspace.permissions);
    return {
        workspace: {
            id: grantedWorkspace.id,
        },
        permissions: grantedWorkspace.isHierarchical ? [] : permissions,
        hierarchyPermissions: grantedWorkspace.isHierarchical ? permissions : [],
    };
};

export const grantedDataSourceAsPermissionAssignment = (
    grantedDataSource: IGrantedDataSource,
): Omit<IDataSourcePermissionAssignment, "assigneeIdentifier"> => {
    const permissions = asDataSourcePermissions(grantedDataSource.permission);
    return {
        dataSource: {
            id: grantedDataSource.id,
        },
        permissions,
    };
};

export const workspacePermissionsAssignmentToGrantedWorkspace = (
    assignment: IWorkspacePermissionAssignment,
): IGrantedWorkspace => {
    const { workspace } = assignment;
    const assignedPermissions =
        assignment.hierarchyPermissions.length > 0 ? assignment.hierarchyPermissions : assignment.permissions;
    return {
        id: workspace.id,
        title: workspace.name ?? "",
        permissions: assignedPermissions,
        isHierarchical: assignment.hierarchyPermissions.length > 0,
    };
};

export const dataSourcePermissionsAssignmentToGrantedDataSource = (
    assignment: IDataSourcePermissionAssignment,
): IGrantedDataSource => {
    const { dataSource } = assignment;
    const permission = asDataSourcePermission(assignment.permissions);
    return {
        id: dataSource.id,
        title: dataSource.name ?? "",
        permission,
    };
};
