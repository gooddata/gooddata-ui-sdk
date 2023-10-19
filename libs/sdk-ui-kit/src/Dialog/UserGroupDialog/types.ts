// (C) 2023 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";
import {
    IWorkspaceDescriptor,
    ManageUsers,
    ManageUserGroups,
    WorkspacePermissionAssignment,
} from "@gooddata/sdk-backend-spi";
import { IWorkspaceUser } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IUserEditDialogApi {
    getUserById?: (userId: string) => Promise<IWorkspaceUser>;
    getUsers?: () => Promise<ManageUsers>;
    getUserGroups?: () => Promise<ManageUserGroups>;
    getWorkspacePermissionsForUser?: (userId: string) => Promise<WorkspacePermissionAssignment[]>;
    getWorkspacePermissionsForUserGroup?: (userGroupId: string) => Promise<WorkspacePermissionAssignment[]>;
    manageWorkspacePermissionsForUser?: (userId: string, permissions: WorkspacePermissionAssignment[]) => Promise<void>;
    manageWorkspacePermissionsForUserGroup?: (userGroupId: string, permissions: WorkspacePermissionAssignment[]) => Promise<void>;
}

/**
 * @internal
 */
export interface IAddWorkspaceSelectProps {
    onSelectWorkspace: (workspace: IWorkspaceDescriptor) => void;
    addedWorkspaces: IGrantedWorkspace[];
    grantedWorkspaces: IGrantedWorkspace[];
}

/**
 * @internal
 */
export interface ISelectOption {
    label: string;
    value: IWorkspaceDescriptor;
}

/**
 * @internal
 */
export const isWorkspaceItem = (obj: unknown): obj is IWorkspaceDescriptor => {
    return (!isEmpty(obj) && (obj as IWorkspaceDescriptor).id !== undefined);
};

/**
 * @internal
 */
export type DialogMode = "VIEW" | "WORKSPACE" | "GROUPS" | "DETAIL";

/**
 * @internal
 */
export type WorkspaceListMode = "VIEW" | "EDIT";

/**
 * @internal
 */
export type WorkspacePermission = "VIEW" | "VIEW_AND_EXPORT" | "ANALYZE" | "ANALYZE_AND_EXPORT" | "MANAGE";

/**
 * @internal
 */
export interface IGrantedWorkspace {
    id: string;
    title: string;
    permission: WorkspacePermission;
    isHierarchical: boolean;
}

export interface IPermissionsItem {
    id: WorkspacePermission;
    enabled: boolean;
    tooltip?: string;
}
