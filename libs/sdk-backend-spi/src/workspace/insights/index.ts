// (C) 2019-2020 GoodData Corporation

import {
    IVisualizationClass,
    IInsight,
    IAttributeDisplayForm,
    IMeasureExpressionToken,
    IInsightDefinition,
    ObjRef,
    IObjectMeta,
} from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging";

/**
 * TODO: SDK8: add public doc
 *
 * @public
 */
export interface IWorkspaceMetadata {
    getVisualizationClass(ref: ObjRef): Promise<IVisualizationClass>;
    getVisualizationClasses(): Promise<IVisualizationClass[]>;
    getInsight(ref: ObjRef): Promise<IInsight>;

    /**
     * Queries workspace insights, optionally using various criteria and paging settings.
     *
     * @param options - query options; if not specified defaults to no sorting, no filtering and 50 items per page
     * @returns paged results, empty page with zero total count if there are no insights stored in the workspace
     */
    getInsights(options?: IInsightQueryOptions): Promise<IInsightQueryResult>;

    createInsight(insight: IInsightDefinition): Promise<IInsight>;

    updateInsight(insight: IInsight): Promise<IInsight>;

    deleteInsight(ref: ObjRef): Promise<void>;

    /**
     * Gets the attribute display form with the provided identifier.
     * @param ref - ref of the attribute display form to retrieve
     * @public
     */
    getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayForm>;

    /**
     * Get measure expression tokens for provided measure identifier
     * @param ref - ref of the measure
     */
    getMeasureExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]>;

    /**
     * Get information about the given fact's dataset
     * @param ref - ref of the fact
     */
    getFactDatasetMeta(ref: ObjRef): Promise<IObjectMeta>;
}

/**
 * Ordering options for insight query.
 *
 * @public
 */
export type InsightOrdering = "id" | "title" | "updated";

/**
 * TODO: SDK8: add docs
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
