// (C) 2024-2026 GoodData Corporation

import { type ObjRef } from "../objRef/index.js";
import { type IUser, type IUserGroup } from "../user/index.js";

/**
 * Entity that represents Workspace Data Filter
 *
 * @alpha
 */
export interface IWorkspaceDataFilter {
    /**
     * @deprecated use {@link IWorkspaceDataFilter#ref} instead.
     */
    id: string;
    ref: ObjRef;
    title?: string;
    columnName?: string;
    settings: IWorkspaceDataFilterSetting[];
    isInherited: boolean;
}

/**
 * Entity that represents Workspace Data Filter setting
 *
 * @alpha
 */
export interface IWorkspaceDataFilterSetting {
    /**
     * @deprecated use {@link IWorkspaceDataFilterSetting#ref} instead.
     */
    id: string;
    ref: ObjRef;
    title?: string;
    filterValues: string[];
    isInherited: boolean;
}

/**
 * Entity that contains data necessary to create a new Workspace Data Filter
 *
 * @alpha
 */
export interface IWorkspaceDataFilterDefinition {
    id?: string;
    title: string;
    columnName: string;
}

/**
 * Common fields shared by all User Data Filter subtypes.
 *
 * @alpha
 */
export interface IUserDataFilterBase {
    ref: ObjRef;
    title?: string;
    description?: string;
    /**
     * MAQL expression defining the filter condition.
     */
    maql: string;
    tags?: string[];
    isInherited: boolean;
}

/**
 * User Data Filter assigned to a specific user.
 *
 * @alpha
 */
export interface IUserDataFilter extends IUserDataFilterBase {
    assignee: IUser;
}

/**
 * User Data Filter assigned to a user group.
 *
 * @alpha
 */
export interface IUserGroupDataFilter extends IUserDataFilterBase {
    assignee: IUserGroup;
}

/**
 * Union of all User Data Filter subtypes.
 *
 * User Data Filters are MAQL-based row-level security filters that can be assigned to
 * a specific user or user group within a workspace.
 *
 * @alpha
 */
export type UserDataFilter = IUserDataFilter | IUserGroupDataFilter;

/**
 * Type guard for {@link IUserDataFilter} — a filter assigned to a specific user.
 *
 * @alpha
 */
export function isUserDataFilter(filter: UserDataFilter): filter is IUserDataFilter {
    return (filter.assignee as IUser).login !== undefined;
}

/**
 * Type guard for {@link IUserGroupDataFilter} — a filter assigned to a user group.
 *
 * @alpha
 */
export function isUserGroupDataFilter(filter: UserDataFilter): filter is IUserGroupDataFilter {
    return (filter.assignee as IUserGroup).id !== undefined && (filter.assignee as IUser).login === undefined;
}

/**
 * Common fields shared by all User Data Filter definition subtypes.
 *
 * @alpha
 */
export interface IUserDataFilterDefinitionBase {
    id?: string;
    title?: string;
    description?: string;
    /**
     * MAQL expression defining the filter condition.
     */
    maql: string;
    tags?: string[];
}

/**
 * Definition for creating or updating a User Data Filter assigned to a specific user.
 *
 * @alpha
 */
export interface IUserDataFilterDefinition extends IUserDataFilterDefinitionBase {
    /**
     * Reference to the user this filter is assigned to.
     */
    userRef: ObjRef;
}

/**
 * Definition for creating or updating a User Data Filter assigned to a user group.
 *
 * @alpha
 */
export interface IUserGroupDataFilterDefinition extends IUserDataFilterDefinitionBase {
    /**
     * Reference to the user group this filter is assigned to.
     */
    userGroupRef: ObjRef;
}

/**
 * Union of all User Data Filter definition subtypes.
 *
 * @alpha
 */
export type UserDataFilterDefinition = IUserDataFilterDefinition | IUserGroupDataFilterDefinition;
