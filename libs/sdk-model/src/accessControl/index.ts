// (C) 2021-2025 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";

import { ObjRef } from "../objRef/index.js";
import { IWorkspaceUser } from "../user/index.js";
import { IWorkspaceUserGroup } from "../userGroup/index.js";

/**
 * User having access to the object.
 *
 * @alpha
 */
export interface IUserAccess {
    /**
     * Access type
     */
    type: "user";
    /**
     * Access user
     */
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
    /**
     * Access type
     */
    type: "group";
    /**
     * Access user group
     */
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
export interface IGranularUserAccess extends IGranteeGranularity {
    /**
     * Access type
     */
    type: "granularUser";
    /**
     * Access user
     */
    user: IWorkspaceUser;
}

/**
 * User group access specification with granular permissions.
 *
 * @alpha
 */
export interface IGranularUserGroupAccess extends IGranteeGranularity {
    /**
     * Access type
     */
    type: "granularGroup";
    /**
     * Access user group
     */
    userGroup: IWorkspaceUserGroup;
}

/**
 * Rules access specification with granular permissions.
 *
 * @alpha
 */
export interface IGranularRulesAccess extends IGranteeGranularity {
    /**
     * Access type
     */
    type: "allWorkspaceUsers";
}

/**
 * Tests whether the provided object is an instance of {@link IGranularUserAccess}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isGranularUserAccess = (obj: unknown): obj is IGranularUserAccess => {
    return !isEmpty(obj) && (obj as IGranularUserAccess).type === "granularUser";
};

/**
 * Tests whether the provided object is an instance of {@link IGranularUserAccess}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isGranularUserGroupAccess = (obj: unknown): obj is IGranularUserGroupAccess => {
    return !isEmpty(obj) && (obj as IGranularUserGroupAccess).type === "granularGroup";
};

/**
 * Tests whether the provided object is an instance of {@link IGranularUserAccess} or {@link IGranularUserGroupAccess}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isGranularAccess = (obj: unknown): obj is IGranularUserAccess | IGranularUserGroupAccess => {
    return isGranularUserAccess(obj) || isGranularUserGroupAccess(obj);
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
    | IGranularUserGroupAccess
    | IGranularRulesAccess;

/**
 * User access grantee specification.
 *
 * @public
 */
export interface IUserAccessGrantee {
    /**
     * Grantee type
     */
    type: "user";
    /**
     * Grantee object reference
     */
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
    /**
     * Grantee type
     */
    type: "group";
    /**
     * Grantee object reference
     */
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
export interface IGranteeGranularity {
    /**
     * Permissions granted directly
     */
    permissions: AccessGranularPermission[];
    /**
     * Permissions granted by inheritance
     */
    inheritedPermissions: AccessGranularPermission[];
}

/**
 * User access grantee specification with granular permissions.
 *
 * @public
 */
export interface IGranularUserAccessGrantee extends IGranteeGranularity {
    /**
     * Access grantee type
     */
    type: "granularUser";
    /**
     * Access grantee object reference
     */
    granteeRef: ObjRef;
}

/**
 * User group access grantee specification with granular permissions.
 *
 * @public
 */
export interface IGranularUserGroupAccessGrantee extends IGranteeGranularity {
    /**
     * Access grantee type
     */
    type: "granularGroup";
    /**
     * Access grantee object reference
     */
    granteeRef: ObjRef;
}

/**
 * All workspace user access grantee specification with granular permissions.
 *
 * @public
 */
export interface IGranularRulesAccessGrantee extends IGranteeGranularity {
    /**
     * Access grantee type
     */
    type: "allWorkspaceUsers";
}

/**
 * Tests whether the provided object is an instance of {@link IGranularUserAccessGrantee}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isGranularUserAccessGrantee = (obj: unknown): obj is IGranularUserAccessGrantee => {
    return !isEmpty(obj) && (obj as IGranularUserAccessGrantee).type === "granularUser";
};

/**
 * Tests whether the provided object is an instance of {@link IGranularUserGroupAccessGrantee}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isGranularUserGroupAccessGrantee = (obj: unknown): obj is IGranularUserGroupAccessGrantee => {
    return !isEmpty(obj) && (obj as IGranularUserGroupAccessGrantee).type === "granularGroup";
};

/**
 * Tests whether the provided object is an instance of {@link IGranularAccessGrantee}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isGranularAccessGrantee = (obj: unknown): obj is IGranularAccessGrantee => {
    return (
        isGranularUserAccessGrantee(obj) ||
        isGranularUserGroupAccessGrantee(obj) ||
        isGranularRulesAccessGrantee(obj)
    );
};

/**
 * Tests whether the provided object is an instance of {@link IGranularUserGroupAccessGrantee}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isGranularRulesAccessGrantee = (obj: unknown): obj is IGranularUserGroupAccessGrantee => {
    return !isEmpty(obj) && (obj as IGranularRulesAccessGrantee).type === "allWorkspaceUsers";
};

/**
 * Access grantee with granular permission.
 *
 * @public
 */
export type IGranularAccessGrantee =
    | IGranularUserAccessGrantee
    | IGranularUserGroupAccessGrantee
    | IGranularRulesAccessGrantee;

/**
 * Access grantee specification.
 *
 * @public
 */
export type IAccessGrantee = IUserGroupAccessGrantee | IUserAccessGrantee | IGranularAccessGrantee;

/**
 * User grantee that is available as target for granting of a permission to shared object.
 *
 * @alpha
 */
export interface IAvailableUserAccessGrantee {
    /**
     * Access grantee type
     */
    type: "user";
    /**
     * Access grantee object reference
     */
    ref: ObjRef;
    /**
     * Access grantee name
     */
    name: string;
    /**
     * Access grantee email
     */
    email?: string;
    /**
     * Access grantee status
     */
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
    /**
     * Access grantee type
     */
    type: "group";
    /**
     * Access grantee object reference
     */
    ref: ObjRef;
    /**
     * Access grantee name
     */
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

/**
 * Type of granted workspace granular access.
 *
 * @public
 */
export type WorkspaceAccessPermission =
    | "VIEW"
    | "VIEW_AND_EXPORT"
    | "ANALYZE"
    | "ANALYZE_AND_EXPORT"
    | "MANAGE";

/**
 * Workspace access specification with granular permissions.
 *
 * @alpha
 */
export interface IWorkspaceAccess {
    /**
     * Access user
     */
    workspace: string;
    /**
     * Permissions granted directly
     */
    permissions: WorkspaceAccessPermission;
}

/**
 * Workspace access for user with granular permissions.
 *
 * @alpha
 */
export type IUserWorkspaceAccessGrantee = IWorkspaceAccess & IGranularUserAccessGrantee;

/**
 * Workspace access for group with granular permissions.
 *
 * @alpha
 */
export type IUserGroupWorkspaceAccessGrantee = IWorkspaceAccess & IGranularUserGroupAccessGrantee;

/**
 * Tests whether the provided object is an instance of {@link IUserWorkspaceAccessGrantee}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isUserWorkspaceAccessGrantee = (obj: unknown): obj is IUserWorkspaceAccessGrantee => {
    return (
        !isEmpty(obj) &&
        (obj as IUserWorkspaceAccessGrantee).workspace !== undefined &&
        isGranularUserAccessGrantee(obj)
    );
};

/**
 * Tests whether the provided object is an instance of {@link IUserWorkspaceAccessGrantee}.
 *
 * @param obj - object to test
 * @alpha
 */
export const isUserGroupWorkspaceAccessGrantee = (obj: unknown): obj is IUserGroupWorkspaceAccessGrantee => {
    return (
        !isEmpty(obj) &&
        (obj as IUserGroupWorkspaceAccessGrantee).workspace !== undefined &&
        isGranularUserGroupAccessGrantee(obj)
    );
};
