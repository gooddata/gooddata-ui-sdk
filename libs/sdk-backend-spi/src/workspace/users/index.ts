// (C) 2019-2021 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging";

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
 * Configuration options for querying users
 *
 * @public
 */
export interface IWorkspaceUsersQueryOptions {
    /**
     * Structured prefix filter
     * - disjunctions are separated by colon (',')
     * - conjunctions are separated by space (' ')
     * - basic form match, if it matches as prefix to any of firstName, lastName and email
     */
    search?: string;

    /**
     * Optionally specify (zero-based) starting offset for the paged results.
     */
    offset?: number;

    /**
     * Optionally specify number of items per page.
     * Default value is 1000
     */
    limit?: number;
}

/**
 * Service to query users for current workspace
 *
 * @public
 */
export interface IWorkspaceUsersQuery {
    /**
     * Allows to specify advanced options for the users query.
     *
     * @param options - advanced options
     * @returns users query
     */
    withOptions(options: IWorkspaceUsersQueryOptions): IWorkspaceUsersQuery;

    /**
     * Starts the users query.
     *
     * @returns promise with a list of all users matching the specified options
     */
    queryAll(): Promise<IWorkspaceUser[]>;

    /**
     * Starts the users query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IWorkspaceUsersQueryResult>;
}

/**
 * Paged result of users query. Last page of data returns empty items.
 *
 * @public
 */
export type IWorkspaceUsersQueryResult = IPagedResource<IWorkspaceUser>;
