// (C) 2021-2026 GoodData Corporation

import { type IUser } from "../user/index.js";

/**
 * Certification status.
 *
 * @internal
 */
export type CertificationStatus = "CERTIFIED";

/**
 * Object certification data.
 *
 * @internal
 */
export interface IObjectCertification {
    /**
     * Certification status.
     */
    status: CertificationStatus;

    /**
     * Optional certification message.
     */
    message?: string;

    /**
     * Optional certification timestamp in backend format.
     */
    certifiedAt?: string;
}

/**
 * Write-safe object certification payload.
 *
 * @internal
 */
export type IObjectCertificationWrite = Pick<IObjectCertification, "status" | "message">;

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
