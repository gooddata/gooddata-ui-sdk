// (C) 2019-2022 GoodData Corporation

import {
    IVisualizationClass,
    IInsight,
    IInsightDefinition,
    ObjRef,
    ObjectType,
    IFilter,
    CatalogItem,
    IMetadataObject,
} from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging.js";

/**
 * Additional options for the {@link IWorkspaceInsightsService.getVisualizationClasses} function.
 *
 * @public
 */
export interface IGetVisualizationClassesOptions {
    /**
     * If true, deprecated visualization classes will be included in the result.
     */
    includeDeprecated?: boolean;
}

/**
 * Service to query, update or delete insights, and other methods related to insights.
 * Check IInsight for more details.
 *
 * @public
 */
export interface IWorkspaceInsightsService {
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
     * @param options - specify additional options
     * @returns promise of visualization classes
     */
    getVisualizationClasses(options?: IGetVisualizationClassesOptions): Promise<IVisualizationClass[]>;

    /**
     * Request insight for the given reference
     *
     * @param ref - insight reference
     * @param options - specify additional options
     * @returns promise of insight
     */
    getInsight(ref: ObjRef, options?: IGetInsightOptions): Promise<IInsight>;

    /**
     * Queries workspace insights, using various criteria and paging settings.
     *
     * @param options - query options; if not specified defaults to no sorting, no filtering and 50 items per page
     * @returns paged results, empty page with zero total count if there are no insights stored in the workspace
     */
    getInsights(options?: IInsightsQueryOptions): Promise<IInsightsQueryResult>;

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
    getInsightReferencedObjects(
        insight: IInsight,
        types?: SupportedInsightReferenceTypes[],
    ): Promise<IInsightReferences>;

    /**
     * Get all metadata objects which uses specified object(ie. object is used by these objects) by a given reference.
     *
     * @param ref - ref of the insight to get referencing objects for
     */
    getInsightReferencingObjects(ref: ObjRef): Promise<IInsightReferencing>;

    /**
     * Get insight with the filters provided merged with the filters specified by the insight itself.
     *
     * @param insight - insight to start with
     * @param filters - filters to merge
     * @returns promise of new insight with the filters merged in
     */
    getInsightWithAddedFilters<T extends IInsightDefinition>(insight: T, filters: IFilter[]): Promise<T>;
}

/**
 * @public
 */
export type InsightReferenceTypes = Exclude<ObjectType, "insight" | "tag" | "colorPalette">;

/**
 * List of currently supported types of references that can be retrieved using the {@link IWorkspaceInsightsService.getInsightReferencedObjects} function.
 * @public
 */
export type SupportedInsightReferenceTypes = Exclude<InsightReferenceTypes, "displayForm" | "variable">;

/**
 * Contains information about objects that may be referenced by an insight.
 *
 * @remarks
 * The contents of this object depend on the insight and the types requested
 * at the time of call to the {@link IWorkspaceInsightsService.getInsightReferencedObjects} function.
 *
 * @public
 */
export interface IInsightReferences {
    /**
     * Requested catalog items.
     *
     * @remarks
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
 * Contains information about objects that may be referencing an insight.
 *
 * @remarks
 * The contents of this object depend on reference of the insight requested at the time
 * of call to the {@link IWorkspaceInsightsService.getInsightReferencingObjects} function.
 *
 * @public
 */
export interface IInsightReferencing {
    /**
     * If requested, metadata about analytical dashboards from which this insight queries data will be returned here.
     */
    analyticalDashboards?: IMetadataObject[];
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
export interface IInsightsQueryOptions {
    /**
     * Specify (zero-based) starting offset for the results. Default: 0
     */
    offset?: number;

    /**
     * Specify number of items per page. Default: 50
     */
    limit?: number;

    /**
     * Specify ordering of the insights. Default: natural ordering provided by the
     * analytical backend. Note: this may differ between backend implementations.
     */
    orderBy?: InsightOrdering;

    /**
     * Filter insights by their author. The value of this property is URI of the author.
     */
    author?: string;

    /**
     * Filter insights by their title
     */
    title?: string;

    /**
     * Specify if information about the users that created/modified the insights should be loaded for each insight.
     *
     * @remarks
     * Defaults to false.
     */
    loadUserData?: boolean;
}

/**
 * Configuration options for getting a single insight.
 *
 * @public
 */
export interface IGetInsightOptions {
    /**
     * Specify if information about the users that created/modified the insight should be loaded.
     *
     * @remarks
     * Defaults to false.
     *
     * If user is inactive or logged in user has not rights to access this information than users that created/modified is undefined.
     */
    loadUserData?: boolean;
}

/**
 * Queried insights are returned in a paged representation.
 *
 * @public
 */
export type IInsightsQueryResult = IPagedResource<IInsight>;
