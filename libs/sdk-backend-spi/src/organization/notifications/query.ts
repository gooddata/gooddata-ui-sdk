// (C) 2024-2025 GoodData Corporation

import { type INotification } from "@gooddata/sdk-model";

import { type IPagedResource } from "../../common/paging.js";

/**
 * Service to query notifications.
 *
 * @public
 */
export interface INotificationsQuery {
    /**
     * Sets number of notifications to return per page.
     * Default size: 100
     *
     * @param size - desired max number of notifications per page must be a positive number
     * @returns notifications query
     */
    withSize(size: number): INotificationsQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns notifications query
     */
    withPage(page: number): INotificationsQuery;

    /**
     * Filter notifications by workspace.
     *
     * @param workspaceId - id of the workspace
     * @returns notifications query
     */
    withWorkspace(workspaceId: string): INotificationsQuery;

    /**
     * Filter notifications by read status.
     *
     * @param status - "read" or "unread"
     * @returns notifications query
     */
    withStatus(status: "read" | "unread"): INotificationsQuery;

    /**
     * Starts the notifications query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<INotificationsQueryResult>;

    /**
     * Starts the notifications query.
     *
     * @returns promise with a list of all notifications matching the specified options
     */
    queryAll(): Promise<INotification[]>;
}

/**
 * Queried notifications are returned in a paged representation.
 *
 * @beta
 */
export type INotificationsQueryResult = IPagedResource<INotification>;
