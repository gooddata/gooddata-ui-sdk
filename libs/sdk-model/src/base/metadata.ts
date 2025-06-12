// (C) 2021 GoodData Corporation
import { IUser } from "../user/index.js";

/**
 * Object that can provide information about the users that created or modified it and when those actions occurred.
 * @public
 */
export interface IAuditableDates {
    /**
     * Creation date - YYYY-MM-DD HH:mm:ss
     */
    created?: string;

    /**
     * Last update date - YYYY-MM-DD HH:mm:ss
     */
    updated?: string;
}

/**
 * Object that can provide information about the users that created or modified it and when those actions occurred.
 * @public
 */
export interface IAuditableUsers {
    /**
     * User id of the user that created the object.
     */
    createdBy?: IUser;

    /**
     * User id of the user that last modified the object.
     */
    updatedBy?: IUser;
}

/**
 * Object that can provide information about the users that created or modified it and when those actions occurred.
 * @public
 */
export type IAuditable = IAuditableDates & IAuditableUsers;
