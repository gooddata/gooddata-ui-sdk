// (C) 2021-2025 GoodData Corporation
import { isEmpty } from "lodash-es";
import { invariant } from "ts-invariant";

import { type IEntitlementDescriptor } from "../entitlements/index.js";
import { type ObjRef } from "../objRef/index.js";
import {
    type IDataSourcePermissionAssignment,
    type IWorkspacePermissionAssignment,
} from "../organization/index.js";

/**
 * Represents platform user.
 *
 * @public
 */
export interface IUser {
    /**
     * Stored user reference.
     */
    ref: ObjRef;

    /**
     * Login - unique user ID for logging into the platform.
     */
    login: string;

    /**
     * Contact email of the user.
     */
    email?: string;

    /**
     * Full name.
     *
     * Note: This property has higher priority than firstName / lastName.
     * Backend implementation MUST fill this property if user names are supported.
     */
    fullName?: string;

    /**
     * First name - when backend implementations supports it.
     */
    firstName?: string;

    /**
     * Last name - when backend implementations supports it.
     */
    lastName?: string;

    /**
     * Organization id - when backend implementations supports it.
     */
    organizationId?: string;

    /**
     * Organization name - when backend implementations supports it.
     */
    organizationName?: string;

    /**
     * Permission of the user
     */
    permissions?: string[];

    /**
     * Authentication id of the user.
     */
    authenticationId?: string;

    /**
     * Entitlements for the user.
     */
    entitlements?: IEntitlementDescriptor[];

    /**
     * In which deployment the user was requested
     */
    deployment?: string;
}

/**
 * Represents platform user group.
 *
 * @alpha
 */
export interface IUserGroup {
    /**
     * Stored user reference.
     */
    ref: ObjRef;

    /**
     * ID of the user group.
     */
    id: string;

    /**
     * Optional name of the user group;
     */
    name?: string;
}

/**
 * Represents platform user in context of the workspace.
 *
 * @public
 */
export interface IWorkspaceUser {
    /**
     * Stored user reference
     */
    ref: ObjRef;

    /**
     * User uri
     */
    uri: string;

    /**
     * Login - unique user ID for logging into the platform
     */
    login: string;

    /**
     * Contact email of the user
     */
    email: string;

    /**
     * Full name.
     *
     * Note: This property has higher priority than firstName / lastName.
     * Backend implementation MUST fill this property if user names are supported.
     */
    fullName?: string;

    /**
     * First name - when backend implementations supports it.
     */
    firstName?: string;

    /**
     * Last name - when backend implementations supports it.
     */
    lastName?: string;

    /**
     * User status - when backend implementations supports it.
     */
    status?: "ENABLED" | "DISABLED";
}

/**
 * Gets the user full name
 *
 * @param user - user to get full name of
 * @returns the user full name
 * @public
 */
export function userFullName(user: IUser): string | undefined {
    invariant(user, "user to get full name of must be specified");

    return user.fullName;
}

/**
 * User with organization related information.
 *
 * @alpha
 */
export interface IOrganizationUser {
    ref: ObjRef;
    id: string;
    fullName?: string;
    email?: string;
    isOrganizationAdmin: boolean;
    assignedUserGroups: IUserGroup[];
    assignedWorkspaces: IWorkspacePermissionAssignment[];
    assignedDataSources: IDataSourcePermissionAssignment[];
}

/**
 * Test if provided object is of IOrganizationUser type
 *
 * @param obj - tested object
 *
 * @returns true if object is IOrganizationUser, false if it is not
 *
 * @alpha
 */
export function isIOrganizationUser(obj: unknown): obj is IOrganizationUser {
    return !isEmpty(obj) && (obj as IOrganizationUser).id !== undefined;
}

/**
 * User group with organization related information.
 *
 * @alpha
 */
export interface IOrganizationUserGroup {
    ref: ObjRef;
    id: string;
    name?: string;
    isOrganizationAdmin: boolean;
    assignedUsersCount: number;
    assignedWorkspaces: IWorkspacePermissionAssignment[];
    assignedDataSources: IDataSourcePermissionAssignment[];
}

/**
 * Test if provided object is of IOrganizationUser type
 *
 * @param obj - tested object
 *
 * @returns true if object is IOrganizationUser, false if it is not
 *
 * @alpha
 */
export function isIOrganizationUserGroup(obj: unknown): obj is IOrganizationUserGroup {
    return !isEmpty(obj) && (obj as IOrganizationUserGroup).id !== undefined;
}
