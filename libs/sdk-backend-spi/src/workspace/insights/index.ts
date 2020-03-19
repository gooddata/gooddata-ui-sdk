// (C) 2019-2020 GoodData Corporation

import { IVisualizationClass, IInsight, IInsightDefinition, ObjRef } from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging";

/**
 * Service to query, update or delete insights, and other methods related to insights.
 * Check IInsight for more details.
 *
 * @public
 */
export interface IWorkspaceInsights {
    /**
     * Request visualization class for the given reference
     *
     * @param ref - visualization class reference
     * @returns promise of visualization class
     */
    getVisualizationClass(ref: ObjRef): Promise<IVisualizationClass>;

    /**
     * Request all visualization classes
     *
     * @returns promise of visualization classes
     */
    getVisualizationClasses(): Promise<IVisualizationClass[]>;

    /**
     * Request insight for the given reference
     *
     * @param ref - insight reference
     * @returns promise of insight
     */
    getInsight(ref: ObjRef): Promise<IInsight>;

    /**
     * Queries workspace insights, optionally using various criteria and paging settings.
     *
     * @param options - query options; if not specified defaults to no sorting, no filtering and 50 items per page
     * @returns paged results, empty page with zero total count if there are no insights stored in the workspace
     */
    getInsights(options?: IInsightQueryOptions): Promise<IInsightQueryResult>;

    /**
     * Create and save insight for the provided insight definition
     *
     * @param insight - insight definition
     * @returns promise of created insight
     */
    createInsight(insight: IInsightDefinition): Promise<IInsight>;

    /**
     * Update provided insight
     *
     * @param insight - insight to update
     * @returns promise of updated insight
     */
    updateInsight(insight: IInsight): Promise<IInsight>;

    /**
     * Delete insight with the given reference
     *
     * @param ref - ref of the insight to delete
     * @returns promise of undefined
     */
    deleteInsight(ref: ObjRef): Promise<void>;
}

/**
 * Ordering options for insight query.
 *
 * @public
 */
export type InsightOrdering = "id" | "title" | "updated";

/**
 * Configuration options for querying insights
 *
 * @public
 */
export interface IInsightQueryOptions {
    /**
     * Optionally specify (zero-based) starting offset for the results. Default: 0
     */
    offset?: number;

    /**
     * Optionally specify number of items per page. Default: 50
     */
    limit?: number;

    /**
     * Optionally specify ordering of the insights. Default: natural ordering provided by the
     * analytical backend. Note: this may differ between backend implementations.
     */
    orderBy?: InsightOrdering;

    /**
     * Optionally filter insights by their author. The value of this property is login of the author.
     */
    author?: string;

    /**
     * Optionally filter insights by their title
     */
    title?: string;
}

/**
 * Queried insights are returned in a paged representation.
 *
 * @public
 */
export interface IInsightQueryResult extends IPagedResource<IInsight> {}
