// (C) 2021-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import * as m from "@gooddata/sdk-model";

/**
 * User having access to the object.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IUserAccess}
 * @alpha
 */
export interface IUserAccess extends m.IUserAccess {}

/**
 * Tests whether the provided object is an instance of {@link IUserAccess}.
 *
 *
 * @deprecated Use {@link @gooddata/sdk-model#isUserAccess} @param obj - object to test
 * @alpha
 */
export const isUserAccess = m.isUserAccess;

/**
 * User group having access to the object.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IUserGroupAccess}
 * @alpha
 */
export interface IUserGroupAccess extends m.IUserGroupAccess {}

/**
 * Tests whether the provided object is an instance of {@link IUserGroupAccess}.
 *
 *
 * @deprecated Use {@link @gooddata/sdk-model#isUserGroupAccess} @param obj - object to test
 * @alpha
 */
export const isUserGroupAccess = m.isUserGroupAccess;

/**
 * Entity having access to the object.
 *
 * @deprecated Use {@link @gooddata/sdk-model#AccessGranteeDetail}
 * @alpha
 */
export type AccessGranteeDetail = IUserAccess | IUserGroupAccess;

/**
 * User access grantee specification.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IUserAccessGrantee}
 * @public
 */
export interface IUserAccessGrantee extends m.IUserAccessGrantee {}

/**
 * Tests whether the provided object is an instance of {@link IUserAccessGrantee}.
 *
 *
 * @deprecated Use {@link @gooddata/sdk-model#isUserAccessGrantee} @param obj - object to test
 * @public
 */
export const isUserAccessGrantee = m.isUserAccessGrantee;

/**
 * User group access grantee specification.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IUserGroupAccessGrantee}
 * @public
 */
export interface IUserGroupAccessGrantee extends m.IUserGroupAccessGrantee {}

/**
 * Tests whether the provided object is an instance of {@link IUserGroupAccessGrantee}.
 *
 *
 * @deprecated Use {@link @gooddata/sdk-model#isUserGroupAccessGrantee} @param obj - object to test
 * @public
 */
export const isUserGroupAccessGrantee = m.isUserGroupAccessGrantee;

/**
 * Access grantee specification.
 *
 * @deprecated Use {@link @gooddata/sdk-model#IAccessGrantee}
 * @public
 */
export type IAccessGrantee = m.IAccessGrantee;
