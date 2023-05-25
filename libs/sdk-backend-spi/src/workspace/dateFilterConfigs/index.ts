// (C) 2019-2022 GoodData Corporation
import { IDateFilterConfig } from "@gooddata/sdk-model";

import { IPagedResource } from "../../common/paging.js";

/**
 * This service provides access to workspace date filter configs (also known as extended date filters).
 * Date filter configs allow to define your own date filter presets, that appear in the date filter.
 * To make date filter configs work, you have to set enableKPIDashboardExtendedDateFilters feature flag to true.
 *
 * @alpha
 */
export interface IDateFilterConfigsQuery {
    /**
     * Sets number of date filter configs to return per page.
     * Default/max limit is specific per backend
     *
     * @param limit - desired max number of date filter configs per page; must be a positive number
     * @returns date filter configs query
     */
    withLimit(limit: number): IDateFilterConfigsQuery;

    /**
     * Sets starting point for the query. Backend WILL return no data if the offset is greater than
     * total number of date filter configs
     * Default offset: 0
     *
     * @param offset - zero indexed, must be non-negative
     * @returns date filter configs query
     */
    withOffset(offset: number): IDateFilterConfigsQuery;

    /**
     * Starts the date filter configs query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IDateFilterConfigsQueryResult>;
}

/**
 * Paged result of valid element query. Last page of data returns empty items.
 *
 * @public
 */
export type IDateFilterConfigsQueryResult = IPagedResource<IDateFilterConfig>;
