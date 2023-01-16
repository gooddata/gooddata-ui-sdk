// (C) 2021-2023 GoodData Corporation
import has from "lodash/has";
import isArray from "lodash/isArray";
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
export type IGranularUserAccess = IUserAccess & IGranularAccessGrantee;

/**
 * User group access specification with granular permissions.
 *
 * @alpha
 */
export type IGranularUserGroupAccess = IUserGroupAccess & IGranularAccessGrantee;

/**
 * Tests whether the provided object is an instance of {@link IGranularUserAccess} or {@link IGranularUserGroupAccess}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isGranularAccess = (obj: unknown): obj is IGranularUserAccess | IGranularUserGroupAccess => {
    return (
        (isUserAccess(obj) || isUserGroupAccess(obj)) &&
        has(obj, "permissions") &&
        isArray((obj as IGranularUserAccess | IGranularUserGroupAccess).permissions)
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
    | IGranularUserAccess
    | IGranularUserGroupAccess;

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
export type AccessGranularPermission = "VIEW" | "EDIT" | "SHARE";

/**
 * Access grantee specification with granular permissions.
 *
 * @public
 */
export interface IGranularAccessGrantee {
    permissions: AccessGranularPermission[];
    inheritedPermissions: AccessGranularPermission[];
}

/**
 * User access grantee specification with granular permissions.
 *
 * @public
 */
export type IGranularUserAccessGrantee = IUserAccessGrantee & IGranularAccessGrantee;

/**
 * User group access grantee specification with granular permissions.
 *
 * @public
 */
export type IGranularUserGroupAccessGrantee = IUserGroupAccessGrantee & IGranularAccessGrantee;

/**
 * Tests whether the provided object is an instance of {@link GranularGrantee}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isGranularGrantee = (obj: unknown): obj is GranularGrantee => {
    return (
        (isUserAccessGrantee(obj) || isUserGroupAccessGrantee(obj)) &&
        has(obj, "permissions") &&
        isArray((obj as GranularGrantee).permissions)
    );
};

/**
 * Access grantee with granular permission.
 *
 * @public
 */
export type GranularGrantee = IGranularUserAccessGrantee | IGranularUserGroupAccessGrantee;

/**
 * Access grantee specification.
 *
 * @public
 */
export type IAccessGrantee = IUserGroupAccessGrantee | IUserAccessGrantee | GranularGrantee;

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
