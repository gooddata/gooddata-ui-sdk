// (C) 2023 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";

export interface IAddWorkspaceSelectProps {
    onSelectWorkspace: (workspace: IWorkspaceDescriptor) => void;
    addedWorkspaces: IGrantedWorkspace[];
    grantedWorkspaces: IGrantedWorkspace[];
}

export interface ISelectOption {
    label: string;
    value: IWorkspaceDescriptor;
}

export const isWorkspaceItem = (obj: unknown): obj is IWorkspaceDescriptor => {
    return !isEmpty(obj) && (obj as IWorkspaceDescriptor).id !== undefined;
};

/**
 * @alpha
 */
export type UserEditDialogMode = "VIEW" | "WORKSPACE" | "USER_GROUPS" | "DETAIL";

/**
 * @alpha
 */
export type UserGroupEditDialogMode = "VIEW" | "WORKSPACE" | "USERS" | "DETAIL";

export type ListMode = "VIEW" | "EDIT";

export type WorkspacePermission = "VIEW" | "VIEW_AND_EXPORT" | "ANALYZE" | "ANALYZE_AND_EXPORT" | "MANAGE";

/**
 * @alpha
 */
export type WorkspacePermissionSubject = "user" | "userGroup";

export interface IGrantedWorkspace {
    id: string;
    title: string;
    permission: WorkspacePermission;
    isHierarchical: boolean;
}

export interface IPermissionsItem {
    id: WorkspacePermission;
    enabled: boolean;
}

export interface IGrantedUserGroup {
    id: string;
    title: string;
}

export const isGrantedUserGroup = (obj: unknown): obj is IGrantedUserGroup => {
    return !isEmpty(obj) && (obj as IGrantedUserGroup).id !== undefined;
};

export interface IUserGroupSelectOption {
    label: string;
    value: IGrantedUserGroup;
}

export interface IUserMember {
    id: string;
    title: string;
    email: string;
}

export const isUserItem = (obj: unknown): obj is IUserMember => {
    return !isEmpty(obj) && (obj as IUserMember).id !== undefined;
};

export interface IUserSelectOption {
    label: string;
    value: IUserMember;
}
