// (C) 2019-2020 GoodData Corporation

import {
    IVisualizationClass,
    IInsight,
    IInsightDefinition,
    ObjRef,
    IMetadataObject,
    ObjectType,
    CatalogItem,
} from "@gooddata/sdk-model";
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

    /**
     * Get all metadata objects referenced by a given insight.
     *
     * @param insight - insight to get referenced objects for
     * @param types - optional array of object types to include, when not specified, all supported references will
     *  be retrieved
     */
    getReferencedObjects(
        insight: IInsight,
        types?: SupportedInsightReferenceTypes[],
    ): Promise<IInsightReferences>;
}

/**
 * @public
 */
export type InsightReferenceTypes = Exclude<ObjectType, "insight" | "tag">;

/**
 * List of currently supported types of references that can be retrieved using getReferencedObjects()
 * @public
 */
export type SupportedInsightReferenceTypes = Exclude<InsightReferenceTypes, "displayForm" | "variable">;

/**
 * Contains information about objects that may be referenced by an insight. The contents of this object
 * depend on the insight and the types requested at the time of call to getReferencedObjects.
 *
 * @public
 */
export interface IInsightReferences {
    /**
     * If requested, measures, attributes, display forms, facts and dateDataSets referenced by the insight will be
     * returned here. If none of them were requested, the catalogItems will be undefined. If some were
     * requested but insight is not referencing those types, then the array will be empty.
     */
    catalogItems?: CatalogItem[];

    /**
     * If requested, metadata about data sets from which this insight queries data will be returned here.
     */
    dataSetMeta?: IMetadataObject[];
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
