// (C) 2023-2024 GoodData Corporation

import isEmpty from "lodash/isEmpty.js";
import { IWorkspaceDescriptor } from "@gooddata/sdk-backend-spi";
import { IDataSourceIdentifierDescriptor } from "@gooddata/sdk-model";

export interface IAddWorkspaceSelectProps {
    onSelectWorkspace: (workspace: IWorkspaceDescriptor) => void;
    addedWorkspaces: IGrantedWorkspace[];
    grantedWorkspaces: IGrantedWorkspace[];
}

export interface IAddDataSourceSelectProps {
    onSelectDataSource: (dataSource: IDataSourceIdentifierDescriptor) => void;
    addedDataSources: IGrantedDataSource[];
    grantedDataSources: IGrantedDataSource[];
}

export interface ISelectOption {
    label: string;
    value: IWorkspaceDescriptor;
}

export interface IDataSourceSelectOption {
    label: string;
    value: IDataSourceIdentifierDescriptor;
}

export const isWorkspaceItem = (obj: unknown): obj is IWorkspaceDescriptor => {
    return !isEmpty(obj) && (obj as IWorkspaceDescriptor).id !== undefined;
};

export const isDataSourceItem = (obj: unknown): obj is IDataSourceIdentifierDescriptor => {
    return !isEmpty(obj) && (obj as IDataSourceIdentifierDescriptor).id !== undefined;
};

/**
 * @internal
 */
export type UserEditDialogMode = "VIEW" | "WORKSPACE" | "USER_GROUPS" | "DATA_SOURCES" | "DETAIL";

/**
 * @internal
 */
export type UserGroupEditDialogMode = "VIEW" | "WORKSPACE" | "USERS" | "DATA_SOURCES" | "DETAIL";

export type ListMode = "VIEW" | "EDIT";

export type WorkspacePermission = "VIEW" | "VIEW_AND_EXPORT" | "ANALYZE" | "ANALYZE_AND_EXPORT" | "MANAGE";

/**
 * @internal
 */
export type DataSourcePermission = "USE" | "MANAGE";

/**
 * @internal
 */
export type WorkspacePermissionSubject = "user" | "userGroup";

/**
 * @internal
 */
export type DataSourcePermissionSubject = "user" | "userGroup";

export interface IGrantedWorkspace {
    id: string;
    title: string;
    permission: WorkspacePermission;
    isHierarchical: boolean;
}

/**
 * @internal
 */
export interface IGrantedDataSource {
    id: string;
    title: string;
    permission: DataSourcePermission;
}

export interface IPermissionsItem {
    id: WorkspacePermission;
    enabled: boolean;
}

export interface IDataSourcePermissionsItem {
    id: DataSourcePermission;
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

export interface ISelectErrorOption {
    isDisabled: boolean;
    type: "error";
    label: string;
}

export const isSelectErrorOption = (obj: unknown): obj is ISelectErrorOption => {
    return !isEmpty(obj) && (obj as ISelectErrorOption).type === "error";
};
