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
 * Entity having access to the object.
 *
 * @alpha
 */
export type AccessGranteeDetail = IUserAccess | IUserGroupAccess;

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
 * Access grantee specification.
 *
 * @public
 */
export type IAccessGrantee = IUserGroupAccessGrantee | IUserAccessGrantee;
