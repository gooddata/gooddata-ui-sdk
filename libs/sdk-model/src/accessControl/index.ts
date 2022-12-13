// (C) 2021-2022 GoodData Corporation
import isEmpty from "lodash/isEmpty";
import { ObjRef } from "../objRef";
import { IWorkspaceUser } from "../user";
import { IWorkspaceUserGroup } from "../userGroup";

/**
 * User having access to the object.
 *
 * @alpha
 */
export interface IUserAccess {
    type: "user";
    user: IWorkspaceUser;
}

/**
 * Tests whether the provided object is an instance of {@link IUserAccess}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isUserAccess = (obj: unknown): obj is IUserAccess => {
    return !isEmpty(obj) && (obj as IUserAccess).type === "user";
};

/**
 * User group having access to the object.
 *
 * @alpha
 */
export interface IUserGroupAccess {
    type: "group";
    userGroup: IWorkspaceUserGroup;
}

/**
 * Tests whether the provided object is an instance of {@link IUserGroupAccess}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isUserGroupAccess = (obj: unknown): obj is IUserGroupAccess => {
    return !isEmpty(obj) && (obj as IUserGroupAccess).type === "group";
};

/**
 * User access specification with granular permissions.
 *
 * @alpha
 */
export type IUserAccessWithGranularPermissions = IUserAccess & IAccessGranteeWithGranularPermissions;

/**
 * User group access specification with granular permissions.
 *
 * @alpha
 */
export type IUserGroupAccessWithGranularPermissions = IUserGroupAccess &
    IAccessGranteeWithGranularPermissions;

/**
 * Tests whether the provided object is an instance of {@link IUserAccessWithGranularPermissions} or {@link IUserGroupAccessWithGranularPermissions}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isAccessWithGranularPermissions = (
    obj: unknown,
): obj is IUserAccessWithGranularPermissions | IUserGroupAccessWithGranularPermissions => {
    return (
        !isEmpty(obj) &&
        (obj as IUserAccessWithGranularPermissions | IUserGroupAccessWithGranularPermissions).permissions !==
            undefined
    );
};

/**
 * Entity having access to the object.
 *
 * @alpha
 */
export type AccessGranteeDetail =
    | IUserAccess
    | IUserGroupAccess
    | IUserAccessWithGranularPermissions
    | IUserGroupAccessWithGranularPermissions;

/**
 * User access grantee specification.
 *
 * @public
 */
export interface IUserAccessGrantee {
    type: "user";
    granteeRef: ObjRef;
}

/**
 * Tests whether the provided object is an instance of {@link IUserAccessGrantee}.
 *
 * @param obj - object to test
 * @public
 */
export const isUserAccessGrantee = (obj: unknown): obj is IUserAccessGrantee => {
    return !isEmpty(obj) && (obj as IUserAccessGrantee).type === "user";
};

/**
 * User group access grantee specification.
 *
 * @public
 */
export interface IUserGroupAccessGrantee {
    type: "group";
    granteeRef: ObjRef;
}

/**
 * Tests whether the provided object is an instance of {@link IUserGroupAccessGrantee}.
 *
 * @param obj - object to test
 * @public
 */
export const isUserGroupAccessGrantee = (obj: unknown): obj is IUserGroupAccessGrantee => {
    return !isEmpty(obj) && (obj as IUserGroupAccessGrantee).type === "group";
};

/**
 * Type of granted granular access.
 *
 * @public
 */
export type IAccessGranularPermission = "VIEW" | "EDIT" | "SHARE";

/**
 * Access grantee specification with granular permissions.
 *
 * @public
 */
export interface IAccessGranteeWithGranularPermissions {
    permissions: IAccessGranularPermission[];
    inheritedPermissions: IAccessGranularPermission[];
}

/**
 * User access grantee specification with granular permissions.
 *
 * @public
 */
export type IUserAccessGranteeWithGranularPermissions = IUserAccessGrantee &
    IAccessGranteeWithGranularPermissions;

/**
 * User group access grantee specification with granular permissions.
 *
 * @public
 */
export type IUserGroupAccessGranteeWithGranularPermissions = IUserGroupAccessGrantee &
    IAccessGranteeWithGranularPermissions;

/**
 * Tests whether the provided object is an instance of {@link IAccessGranteeWithGranularPermissions}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isAccessGranteeWithGranularPermissions = (
    obj: unknown,
): obj is IAccessGranteeWithGranularPermissions => {
    return !isEmpty(obj) && (obj as IAccessGranteeWithGranularPermissions).permissions !== undefined;
};

/**
 * Access grantee with granular permission.
 *
 * @public
 */
export type GranteeWithGranularPermissions =
    | IUserAccessGranteeWithGranularPermissions
    | IUserGroupAccessGranteeWithGranularPermissions;

/**
 * Access grantee specification.
 *
 * @public
 */
export type IAccessGrantee = IUserGroupAccessGrantee | IUserAccessGrantee | GranteeWithGranularPermissions;

/**
 * User grantee that is available as target for granting of a permission to shared object.
 *
 * @alpha
 */
export interface IAvailableUserAccessGrantee {
    type: "user";
    ref: ObjRef;
    name: string;
    email?: string;
    status: "ENABLED" | "DISABLED";
}

/**
 * Tests whether the provided object is an instance of {@link IAvailableUserAccessGrantee}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isAvailableUserAccessGrantee = (obj: unknown): obj is IAvailableUserAccessGrantee => {
    return !isEmpty(obj) && (obj as IAvailableUserAccessGrantee).type === "user";
};

/**
 * User group grantee that is available as target for granting of a permission to shared object.
 *
 * @alpha
 */
export interface IAvailableUserGroupAccessGrantee {
    type: "group";
    ref: ObjRef;
    name: string;
}

/**
 * Tests whether the provided object is an instance of {@link IAvailableUserGroupAccessGrantee}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isAvailableUserGroupAccessGrantee = (obj: unknown): obj is IAvailableUserGroupAccessGrantee => {
    return !isEmpty(obj) && (obj as IAvailableUserGroupAccessGrantee).type === "group";
};

/**
 * Grantee that is available as target for granting of a permission to shared object.
 *
 * @alpha
 */
export type IAvailableAccessGrantee = IAvailableUserAccessGrantee | IAvailableUserGroupAccessGrantee;
