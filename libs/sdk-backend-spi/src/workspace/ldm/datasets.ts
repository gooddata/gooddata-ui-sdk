// (C) 2019-2025 GoodData Corporation

import {
    type IDataSetMetadataObject,
    type IDataset,
    type IMetadataObject,
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type ObjRef,
    type ObjectOrigin,
} from "@gooddata/sdk-model";

import type { IFilterBaseOptions } from "../../common/filtering.js";
import type { IPagedResource } from "../../common/paging.js";
import type { QueryMethod } from "../../common/query.js";

/**
 * Service for querying workspace datasets
 *
 * @public
 */
export interface IWorkspaceDatasetsService {
    /**
     * Receive all workspace csv datasets
     *
     * @returns promise of workspace csv datasets
     */
    getDatasets(): Promise<IDataset[]>;

    /**
     * Receive all workspace datasets metadata
     *
     * @returns promise of workspace datasets metadata
     */
    getAllDatasetsMeta(): Promise<IMetadataObject[]>;

    /**
     * Get all dataSets for given refs
     *
     * @returns promise array of workspace dataSets metadata objects
     */
    getDataSets(refs: ObjRef[]): Promise<IDataSetMetadataObject[]>;

    /**
     * Get dataset by reference.
     *
     * @param ref - ref of the dataset
     * @returns promise of dataset metadata object
     * @beta
     */
    getDataset(ref: ObjRef): Promise<IDataSetMetadataObject>;

    /**
     * Updates metadata object for the dataset.
     *
     * @param dataSet - dataset metadata object to update
     * @returns promise of updated dataset metadata object
     * @beta
     */
    updateDatasetMeta(
        dataSet: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IDataSetMetadataObject>;

    /**
     * Datasets query factory.
     *
     * @returns datasets query
     * @beta
     */
    getDatasetsQuery(): IDatasetsQuery;
}

/**
 * Service to query datasets.
 *
 * @beta
 */
export interface IDatasetsQuery {
    /**
     * Sets number of datasets to return per page.
     * Default size: 50
     *
     * @param size - desired max number of datasets per page must be a positive number
     * @returns datasets query
     */
    withSize(size: number): IDatasetsQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns datasets query
     */
    withPage(page: number): IDatasetsQuery;

    /**
     * Sets filter for the query.
     *
     * @param filter - filter to apply
     * @returns datasets query
     */
    withFilter(filter: IDatasetsQueryFilterOptions): IDatasetsQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @returns datasets query
     */
    withSorting(sort: string[]): IDatasetsQuery;

    /**
     * Sets include for the query.
     *
     * @param include - include to apply
     * @returns datasets query
     */
    withInclude(include: string[]): IDatasetsQuery;

    /**
     * Sets origin for the query.
     *
     * @param origin - origin to apply. This is an open string union to allow platform-specific origin values in addition to the built-in literals.
     * @returns datasets query
     */
    withOrigin(origin: ObjectOrigin | (string & {})): IDatasetsQuery;

    /**
     * Selects which backend endpoint flavor to use when listing datasets.
     * Default method: "GET"
     *
     * @param method - endpoint flavor to use ("GET" or "POST")
     * @returns datasets query
     * @beta
     */
    withMethod(method: QueryMethod): IDatasetsQuery;

    /**
     * Starts the query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IDatasetsQueryResult>;
}

/**
 * Queried datasets are returned in a paged representation.
 *
 * @beta
 */
export type IDatasetsQueryResult = IPagedResource<IDataSetMetadataObject>;

/**
 * Datasets-specific filter options.
 *
 * @beta
 */
export interface IDatasetsQueryFilterOptions extends IFilterBaseOptions {
    /**
     * Dataset type to include (e.g. "DATE" for date datasets).
     *
     * @beta
     */
    dataSetType?: "DATE" | "NORMAL";
}
