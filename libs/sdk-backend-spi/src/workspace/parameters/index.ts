// (C) 2026 GoodData Corporation

import {
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type IParameterMetadataObject,
    type IParameterMetadataObjectDefinition,
    type ObjRef,
    type ObjectOrigin,
} from "@gooddata/sdk-model";

import type { IFilterBaseOptions } from "../../common/filtering.js";
import type { IPagedResource } from "../../common/paging.js";
import type { QueryMethod } from "../../common/query.js";

/**
 * Service for querying additional parameter data.
 *
 * @public
 */
export interface IWorkspaceParametersService {
    /**
     * Create and save parameter for the provided parameter definition.
     *
     * @param parameter - parameter definition
     * @returns promise of created parameter
     */
    createParameter(parameter: IParameterMetadataObjectDefinition): Promise<IParameterMetadataObject>;

    /**
     * Parameters query factory.
     *
     * @returns parameters query
     */
    getParametersQuery(): IParametersQuery;

    /**
     * Get parameter by reference.
     *
     * @param ref - ref of the parameter to get
     * @returns promise of parameter
     */
    getParameter(ref: ObjRef): Promise<IParameterMetadataObject>;

    /**
     * Updates metadata of the parameter.
     *
     * @param updatedParameter - update to apply
     */
    updateParameterMeta(
        updatedParameter: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IParameterMetadataObject>;
}

/**
 * Service to query parameters.
 *
 * @public
 */
export interface IParametersQuery {
    /**
     * Sets number of parameters to return per page.
     * Default size: 50
     *
     * @param size - desired max number of parameters per page must be a positive number
     * @returns parameters query
     */
    withSize(size: number): IParametersQuery;

    /**
     * Sets starting page for the query.
     *
     * @param page - zero indexed, must be non-negative
     * @returns parameters query
     */
    withPage(page: number): IParametersQuery;

    /**
     * Sets filter for the query.
     *
     * @param filter - filter to apply
     * @returns parameters query
     */
    withFilter(filter: IFilterBaseOptions): IParametersQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - sorting criteria in the format: property,(asc|desc)
     * @returns parameters query
     */
    withSorting(sort: string[]): IParametersQuery;

    /**
     * Sets include for the query.
     *
     * @param include - include to apply
     * @returns parameters query
     */
    withInclude(include: string[]): IParametersQuery;

    /**
     * Sets origin for the query.
     *
     * @param origin - origin to apply
     * @returns parameters query
     */
    withOrigin(origin: ObjectOrigin | (string & {})): IParametersQuery;

    /**
     * Selects which backend endpoint flavor to use when listing parameters.
     * Default method: "GET"
     *
     * @param method - endpoint flavor to use ("GET" or "POST")
     * @returns parameters query
     * @beta
     */
    withMethod(method: QueryMethod): IParametersQuery;

    /**
     * Starts the query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IParametersQueryResult>;
}

/**
 * Queried parameters are returned in a paged representation.
 *
 * @public
 */
export type IParametersQueryResult = IPagedResource<IParameterMetadataObject>;
