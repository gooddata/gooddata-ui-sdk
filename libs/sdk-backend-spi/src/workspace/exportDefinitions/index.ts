// (C) 2019-2024 GoodData Corporation

import {
    ObjRef,
    IExportDefinitionMetadataObject,
    IExportDefinitionMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging.js";

/**
 * Service to query, update or delete exportDefinitions, and other methods related to exportDefinitions.
 * Check IExportDefinitionMetadataObject for more details.
 *
 * @alpha
 */
export interface IWorkspaceExportDefinitionsService {
    /**
     * Request exportDefinition for the given reference
     *
     * @param ref - exportDefinition reference
     * @param options - specify additional options
     * @returns promise of exportDefinition
     */
    getExportDefinition(
        ref: ObjRef,
        options?: IGetExportDefinitionOptions,
    ): Promise<IExportDefinitionMetadataObject>;

    /**
     * Queries workspace exportDefinitions, using various criteria and paging settings.
     *
     * @param options - query options; if not specified defaults to no sorting, no filtering and 50 items per page
     * @returns paged results, empty page with zero total count if there are no exportDefinitions stored in the workspace
     */
    getExportDefinitions(options?: IExportDefinitionsQueryOptions): Promise<IExportDefinitionsQueryResult>;

    /**
     * List exportDefinitions
     *
     * @returns methods for querying exportDefinitions
     */
    getExportDefinitionsQuery(): IExportDefinitionsQuery;

    /**
     * Create and save exportDefinition for the provided exportDefinition
     *
     * @param exportDefinition - exportDefinition to create
     * @returns promise of created exportDefinition
     */
    createExportDefinition(
        exportDefinition: IExportDefinitionMetadataObjectDefinition,
    ): Promise<IExportDefinitionMetadataObject>;

    /**
     * Update provided exportDefinition
     *
     * @param ref - ref of the exportDefinition to update
     * @param exportDefinition - exportDefinition to update
     * @returns promise of updated exportDefinition
     */
    updateExportDefinition(
        ref: ObjRef,
        exportDefinition: IExportDefinitionMetadataObjectDefinition,
    ): Promise<IExportDefinitionMetadataObject>;

    /**
     * Delete exportDefinition with the given reference
     *
     * @param ref - ref of the exportDefinition to delete
     * @returns promise of undefined
     */
    deleteExportDefinition(ref: ObjRef): Promise<void>;
}

/**
 * Ordering options for exportDefinition query.
 *
 * @alpha
 */
export type ExportDefinitionOrdering = "id" | "title" | "updated";

/**
 * Configuration options for querying exportDefinitions
 *
 * @alpha
 */
export interface IExportDefinitionsQueryOptions {
    /**
     * Specify (zero-based) starting offset for the results. Default: 0
     */
    offset?: number;

    /**
     * Specify number of items per page. Default: 50
     */
    limit?: number;

    /**
     * Specify ordering of the exportDefinitions. Default: natural ordering provided by the
     * analytical backend.
     */
    orderBy?: ExportDefinitionOrdering;

    /**
     * Filter exportDefinitions by their author. The value of this property is identifier of the author.
     */
    author?: string;

    /**
     * Filter exportDefinitions by their title
     */
    title?: string;

    /**
     * Specify if information about the users that created/modified the exportDefinitions should be loaded for each exportDefinition.
     *
     * @remarks
     * Defaults to false.
     */
    loadUserData?: boolean;
}

/**
 * Configuration options for getting a single exportDefinition.
 *
 * @alpha
 */
export interface IGetExportDefinitionOptions {
    /**
     * Specify if information about the users that created/modified the exportDefinition should be loaded.
     *
     * @remarks
     * Defaults to false.
     *
     * If user is inactive or logged in user has not rights to access this information than users that created/modified is undefined.
     */
    loadUserData?: boolean;
}

/**
 * Sort direction for exportDefinition query.
 *
 * @alpha
 */
export type ExportDefinitionQuerySortDirection = "asc" | "desc";

/**
 * Sort order for exportDefinition query.
 *
 * @alpha
 */
export type ExportDefinitionQuerySortProperty = "id" | "title";

/**
 * Sort criteria for exportDefinition query.
 *
 * @alpha
 */
export type ExportDefinitionQuerySort =
    | ExportDefinitionQuerySortProperty
    | `${ExportDefinitionQuerySortProperty},${ExportDefinitionQuerySortDirection}`;

/**
 * Service to query exportDefinitions.
 *
 * @alpha
 */
export interface IExportDefinitionsQuery {
    /**
     * Sets number of exportDefinitions to return per page.
     * Default size: 50
     *
     * @param size - desired max number of exportDefinitions per page must be a positive number
     * @returns exportDefinitions query
     */
    withSize(size: number): IExportDefinitionsQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns exportDefinitions query
     */
    withPage(page: number): IExportDefinitionsQuery;

    /**
     * Sets filter for the query.
     *
     * @param filter - filter to apply
     * @returns exportDefinitions query
     */
    withFilter(filter: { title?: string }): IExportDefinitionsQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @returns exportDefinitions query
     */
    withSorting(sort: ExportDefinitionQuerySort[]): IExportDefinitionsQuery;

    /**
     * Starts the query.
     *
     * @returns promise of the first page of the results
     */
    query(): Promise<IExportDefinitionsQueryResult>;
}

/**
 * Queried exportDefinitions are returned in a paged representation.
 *
 * @alpha
 */
export type IExportDefinitionsQueryResult = IPagedResource<IExportDefinitionMetadataObject>;
