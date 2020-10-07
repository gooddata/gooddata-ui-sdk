// (C) 2019-2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";

/**
 * User
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
     * Login
     */
    login: string;
    /**
     * Email
     */
    email: string;
    /**
     * First name
     */
    firstName?: string;
    /**
     * Last name
     */
    lastName?: string;
}

/**
 * Configuration options for querying users
 *
 * @public
 */
export interface IWorkspaceUserQueryOptions {
    /**
     * Structured prefix filter
     * - disjunctions are separated by colon (',')
     * - conjunctions are separated by space (' ')
     * - basic form match, if it matches as prefix to any of firstName, lastName and email
     */
    search?: string;
}

/**
 * Service to query users for current workspace
 *
 * @public
 */
export interface IWorkspaceUserQuery {
    /**
     * Allows to specify advanced options for the users query.
     *
     * @param options - advanced options
     * @returns users query
     */
    withOptions(options: IWorkspaceUserQueryOptions): IWorkspaceUserQuery;

    /**
     * Starts the users query.
     *
     * @returns promise with a list of all users matching the specified options
     */
    queryAll(): Promise<IWorkspaceUser[]>;
}
