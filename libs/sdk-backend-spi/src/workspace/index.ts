// (C) 2019 GoodData Corporation
import { IWorkspace } from "@gooddata/sdk-model";
import { IPagedResource } from "../paging";

/**
 * Factory providing creating queries used to get available workspaces.
 *
 * @public
 */
export interface IWorkspaceQueryFactory {
    /**
     * Creates a query for workspaces available to the specified user.
     *
     * @param userId - id of the user to retrieve workspaces for
     * @public
     */
    forUser(userId: string): IWorkspaceQuery;

    /**
     * Creates a query for workspaces available to the user currently logged in.
     *
     * @public
     */
    forCurrentUser(): IWorkspaceQuery;
}

/**
 * Query to retrieve available worksapces.
 *
 * @public
 */
export interface IWorkspaceQuery {
    /**
     * Sets a limit on how many items to retrieve at once.
     * @param limit - how many items to retrieve at most
     *
     * @public
     */
    withLimit(limit: number): IWorkspaceQuery;

    /**
     * Sets a number of items to skip.
     * @param offset - how many items to skip
     */
    withOffset(offset: number): IWorkspaceQuery;

    /**
     * Executes the query and returns the result asynchronously.
     */
    query(): Promise<IWorkspaceQueryResult>;
}

/**
 * Paged resource with results of a workspace query.
 *
 * @public
 */
export interface IWorkspaceQueryResult extends IPagedResource<IWorkspace> {}
