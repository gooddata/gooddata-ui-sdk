// (C) 2019-2022 GoodData Corporation
/* eslint-disable @typescript-eslint/no-empty-interface, import/namespace */
import { IWorkspaceUser } from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging.js";

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
     * Specify (zero-based) starting offset for the paged results.
     */
    offset?: number;

    /**
     * Specify number of items per page.
     *
     * @remarks
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
