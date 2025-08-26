// (C) 2019-2025 GoodData Corporation
import { IFactMetadataObject, IMetadataObject, ObjRef } from "@gooddata/sdk-model";

import { IFilterBaseOptions } from "../../common/filtering.js";
import { IPagedResource } from "../../common/paging.js";

/**
 * Service for querying additional facts data.
 * If you want to query facts themselves, use catalog {@link IWorkspaceCatalogFactory}
 *
 * @public
 */
export interface IWorkspaceFactsService {
    /**
     * Get information about the given fact's dataset
     * @param ref - ref of the fact
     * @returns promise of metadata object
     */
    getFactDatasetMeta(ref: ObjRef): Promise<IMetadataObject>;
    /**
     * Facts query factory.
     *
     * @returns facts query
     */
    getFactsQuery(): IFactsQuery;
}

/**
 * Service to query facts.
 *
 * @public
 */
export interface IFactsQuery {
    /**
     * Sets number of facts to return per page.
     * Default size: 50
     *
     * @param size - desired max number of facts per page must be a positive number
     * @returns facts query
     */
    withSize(size: number): IFactsQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns facts query
     */
    withPage(page: number): IFactsQuery;

    /**
     * Sets filter for the query.
     *
     * @param filter - filter to apply
     * @returns facts query
     */
    withFilter(filter: IFilterBaseOptions): IFactsQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @returns facts query
     */
    withSorting(sort: string[]): IFactsQuery;

    /**
     * Sets include for the query.
     *
     * @param include - include to apply
     * @returns facts query
     */
    withInclude(include: string[]): IFactsQuery;

    /**
     * Starts the query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IFactsQueryResult>;
}

/**
 * Queried attributes are returned in a paged representation.
 *
 * @public
 */
export type IFactsQueryResult = IPagedResource<IFactMetadataObject>;
