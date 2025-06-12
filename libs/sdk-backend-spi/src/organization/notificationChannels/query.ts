// (C) 2023-2024 GoodData Corporation

import { INotificationChannelMetadataObject, NotificationChannelDestinationType } from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging.js";

/**
 * Service to query notification channels.
 *
 * @beta
 */
export interface INotificationChannelsQuery {
    /**
     * Sets number of notification channels to return per page.
     * Default size: 100
     *
     * @param size - desired max number of notification channels per page must be a positive number
     * @returns notification channels query
     */
    withSize(size: number): INotificationChannelsQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns notification channels query
     */
    withPage(page: number): INotificationChannelsQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @returns notification channels query
     */
    withSorting(sort: string[]): INotificationChannelsQuery;

    /**
     * Sets type of the automation for the query.
     *
     * @param type - type of the automation, e.g. "schedule" or "trigger"
     * @returns notification channels query
     */
    withTypes(type: NotificationChannelDestinationType[]): INotificationChannelsQuery;

    /**
     * Starts the notification channels query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<INotificationChannelsQueryResult>;

    /**
     * Starts the notification channels query.
     *
     * @returns promise with a list of all notification channels matching the specified options
     */
    queryAll(): Promise<INotificationChannelMetadataObject[]>;
}

/**
 * Queried notification channels are returned in a paged representation.
 *
 * @beta
 */
export type INotificationChannelsQueryResult = IPagedResource<INotificationChannelMetadataObject>;
