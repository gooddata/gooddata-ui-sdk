// (C) 2026 GoodData Corporation

import type {
    IComputedAttributeMetadataObject,
    IComputedAttributeMetadataObjectDefinition,
    IMetadataObjectBase,
    IMetadataObjectIdentity,
    ObjRef,
    ObjectOrigin,
} from "@gooddata/sdk-model";

import type { IFilterBaseOptions } from "../../common/filtering.js";
import type { IPagedResource } from "../../common/paging.js";
import type { QueryMethod } from "../../common/query.js";
import type { IMeasureExpressionToken } from "../measures/measure.js";

/**
 * Options for getting a computed attribute.
 *
 * @public
 */
export interface IGetComputedAttributeOptions {
    /**
     * Specifies whether information about the users who created or modified the computed attribute
     * should be loaded.
     *
     * @remarks
     * Defaults to false.
     */
    loadUserData?: boolean;
}

/**
 * Service for create, update or delete computed attributes and querying them.
 *
 * @public
 */
export interface IWorkspaceComputedAttributesService {
    /**
     * Create and save computed attribute for the provided definition.
     *
     * @param computedAttribute - computed attribute definition
     * @returns promise of created computed attribute
     */
    createComputedAttribute(
        computedAttribute: IComputedAttributeMetadataObjectDefinition,
    ): Promise<IComputedAttributeMetadataObject>;

    /**
     * Update provided computed attribute.
     *
     * @param computedAttribute - computed attribute to update
     * @returns promise of updated computed attribute
     */
    updateComputedAttribute(
        computedAttribute: IComputedAttributeMetadataObject,
    ): Promise<IComputedAttributeMetadataObject>;

    /**
     * Update metadata of the computed attribute.
     *
     * @param computedAttribute - metadata update to apply
     * @returns promise of updated computed attribute
     */
    updateComputedAttributeMeta(
        computedAttribute: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IComputedAttributeMetadataObject>;

    /**
     * Delete computed attribute with the given reference.
     *
     * @param ref - ref of the computed attribute to delete
     * @returns promise of undefined
     */
    deleteComputedAttribute(ref: ObjRef): Promise<void>;

    /**
     * Get computed attribute by reference.
     *
     * @param ref - ref of the computed attribute to get
     * @param options - options for getting the computed attribute
     * @returns promise of computed attribute
     */
    getComputedAttribute(
        ref: ObjRef,
        options?: IGetComputedAttributeOptions,
    ): Promise<IComputedAttributeMetadataObject>;

    /**
     * Get the expression tokens of the computed attribute's MAQL, with every referenced object
     * resolved to its title.
     *
     * @param ref - ref of the computed attribute
     * @returns promise of the expression tokens
     */
    getComputedAttributeExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]>;

    /**
     * Computed attributes query factory.
     *
     * @returns computed attributes query
     */
    getComputedAttributesQuery(): IComputedAttributesQuery;
}

/**
 * Service to query computed attributes.
 *
 * @public
 */
export interface IComputedAttributesQuery {
    /**
     * Sets number of computed attributes to return per page.
     * Default size: 50
     *
     * @param size - desired max number of computed attributes per page must be a positive number
     * @returns computed attributes query
     */
    withSize(size: number): IComputedAttributesQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns computed attributes query
     */
    withPage(page: number): IComputedAttributesQuery;

    /**
     * Sets filter for the query.
     *
     * @param filter - filter to apply
     * @returns computed attributes query
     */
    withFilter(filter: IFilterBaseOptions): IComputedAttributesQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @returns computed attributes query
     */
    withSorting(sort: string[]): IComputedAttributesQuery;

    /**
     * Sets include for the query.
     *
     * @param include - include to apply
     * @returns computed attributes query
     */
    withInclude(include: string[]): IComputedAttributesQuery;

    /**
     * Sets origin for the query.
     *
     * @param origin - origin to apply. This is an open string union to allow platform-specific origin values in addition to the built-in literals.
     * @returns computed attributes query
     */
    withOrigin(origin: ObjectOrigin | (string & {})): IComputedAttributesQuery;

    /**
     * Selects which backend endpoint flavor to use when listing computed attributes.
     * Default method: "GET"
     *
     * @param method - endpoint flavor to use ("GET" or "POST")
     * @returns computed attributes query
     * @beta
     */
    withMethod(method: QueryMethod): IComputedAttributesQuery;

    /**
     * Starts the query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IComputedAttributesQueryResult>;
}

/**
 * Queried computed attributes are returned in a paged representation.
 *
 * @public
 */
export type IComputedAttributesQueryResult = IPagedResource<IComputedAttributeMetadataObject>;
