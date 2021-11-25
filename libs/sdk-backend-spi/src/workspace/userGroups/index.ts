// (C) 2019-2021 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging";

/**
 * User Group
 * @alpha
 */
export interface IWorkspaceUserGroup {
    /**
     * Stored user group reference
     */
    ref: ObjRef;
    /**
     * Stored user group id
     */
    id?: string;
    /**
     * Group name
     */
    name?: string;
    /**
     * Group description
     */
    description?: string;
}

/**
 * Configuration options for querying user groups
 *
 * @alpha
 */
export interface IWorkspaceUserGroupsQueryOptions {
    /**
     * String prefix filter
     */
    search?: string;

    /**
     * Optionally specify (zero-based) starting offset for the results.
     */
    offset?: number;

    /**
     * Optionally specify number of items per page.
     */
    limit?: number;
}

/**
 * Service to query user groups for current workspace
 *
 * @alpha
 */
export interface IWorkspaceUserGroupsQuery {
    /**
     * Starts the user groups query.
     *
     * @returns promise with a list of all user groups matching the specified options
     */
    query(options: IWorkspaceUserGroupsQueryOptions): Promise<IWorkspaceUserGroupsQueryResult>;
}

/**
 * Paged result of user groups query. Last page of data returns empty items.
 *
 * @alpha
 */
export type IWorkspaceUserGroupsQueryResult = IPagedResource<IWorkspaceUserGroup>;
