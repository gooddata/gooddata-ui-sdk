// (C) 2021 GoodData Corporation

import { ObjRef } from "@gooddata/sdk-model";

import { IWorkspaceUser } from "../users";
import { IWorkspaceUserGroup } from "../userGroups";
import isEmpty from "lodash/isEmpty";

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
 * New grantee specification.
 *
 * @alpha
 */
export interface IAccessGrantee {
    granteeRef: ObjRef;
}

/**
 * Service to manage access to the objects.
 *
 * @alpha
 */
export interface IWorkspaceAccessControlService {
    getAccessList(sharedObject: ObjRef): Promise<AccessGranteeDetail[]>;

    grantAccess(sharedObject: ObjRef, grantees: IAccessGrantee[]): Promise<void>;

    revokeAccess(sharedObject: ObjRef, grantess: IAccessGrantee[]): Promise<void>;
}
