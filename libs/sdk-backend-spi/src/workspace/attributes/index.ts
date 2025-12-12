// (C) 2019-2025 GoodData Corporation

import {
    type IAttributeDisplayFormMetadataObject,
    type IAttributeMetadataObject,
    type IDataSetMetadataObject,
    type IMetadataObject,
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type ObjRef,
    type ObjectOrigin,
} from "@gooddata/sdk-model";

import type { IElementsQueryFactory } from "./elements/index.js";
import type { IFilterBaseOptions } from "../../common/filtering.js";
import type { IPagedResource } from "../../common/paging.js";
import type { QueryMethod } from "../../common/query.js";

/**
 * @beta
 */
export interface IAttributeWithReferences {
    /**
     * Attribute metadata object
     */
    attribute: IAttributeMetadataObject;

    /**
     * Attribute related data set metadata object.
     */
    dataSet?: IDataSetMetadataObject;
}

/**
 * Service for querying additional attributes and attribute display forms data, and their elements.
 *
 * @remarks
 * If you want to query attributes themselves, use catalog {@link IWorkspaceCatalogFactory}
 *
 * @public
 */
export interface IWorkspaceAttributesService {
    /**
     * Returns service that can be used to query attribute elements for attributes defined in this workspace.
     *
     * @remarks
     * For instance if workspace has data set Employee with attribute Name, then this service can be used to retrieve
     * names of all employees.
     */
    elements(): IElementsQueryFactory;

    /**
     * Gets the attribute display form with the provided identifier.
     * @param ref - ref of the attribute display form to retrieve
     * @returns promise of attribute display form metadata object
     */
    getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject>;

    /**
     * Gets the list of metadata of attribute display form with the provided list of uris or identifiers. (list of object refs).
     *
     * @remarks
     * If a display form referenced by any of the refs does not exist, then the call must not fail and instead return only
     * those display forms that exist.
     *
     * @param refs - list of refs of the attribute display form to retrieve.
     * @returns promise of list of attribute display form metadata object.
     */
    getAttributeDisplayForms(refs: ObjRef[]): Promise<IAttributeDisplayFormMetadataObject[]>;

    /**
     * Gets metadata of the attribute for particular display form reference.
     *
     * @param ref - ref of the display form to retrieve attribute for
     * @returns promise of attribute metadata object
     */
    getAttributeByDisplayForm(ref: ObjRef): Promise<IAttributeMetadataObject>;

    /**
     * Gets metadata of the attribute.
     *
     * @param ref - ref of the attribute to retrieve
     * @param opts - options to include additional data
     * @returns promise of attribute metadata object
     */
    getAttribute(ref: ObjRef, opts?: { include?: ["dataset"] }): Promise<IAttributeMetadataObject>;

    /**
     * Updates metadata of the attribute.
     *
     * @param updatedAttribute - update to apply
     */
    updateAttributeMeta(
        updatedAttribute: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IAttributeMetadataObject>;

    /**
     * Gets the list of metadata of attribute with the provided list of uris. (list of object refs)
     *
     * @remarks
     * If a display form referenced by any of the refs does not exist, then the call must not fail and instead return only
     * those display forms that exist.
     *
     * @param refs - list of refs of the attribute to retrieve.
     * @returns promise of list of attribute metadata object.
     */
    getAttributes(refs: ObjRef[]): Promise<IAttributeMetadataObject[]>;

    /**
     * Request list of attributes that are "center of star" for the input attributes in the data model.
     *
     * @param attributeRefs - input list of attribute references
     * @returns promise returning list of attribute references.
     * It can be one of the input attributes or another attribute(s)
     * that connects the input attributes in the data model.
     */
    getCommonAttributes(attributeRefs: ObjRef[]): Promise<ObjRef[]>;

    /**
     * Request the "center of star" for multiple series of attributes.
     *
     * @param attributesRefsBatch - input batch of list of attribute references
     * @returns promise returning batch of attribute references.
     */
    getCommonAttributesBatch(attributesRefsBatch: ObjRef[][]): Promise<ObjRef[][]>;

    /**
     * Get information about the given attribute's dataset
     * @param ref - ref of the attribute
     * @returns promise of metadata object
     */
    getAttributeDatasetMeta(ref: ObjRef): Promise<IMetadataObject>;

    /**
     * Get attributes with their related objects, by their respective display forms.
     * @param refs - refs of the attributes
     * @returns promise of attributes with their related objects
     */
    getAttributesWithReferences(displayFormRefs: ObjRef[]): Promise<IAttributeWithReferences[]>;

    /**
     * Request list of attributes that have a connection with specified display form in the data model.
     *
     * @param ref - attribute display form reference whose connections we need to find
     * @returns promise of array of connected attribute references
     */
    getConnectedAttributesByDisplayForm(ref: ObjRef): Promise<ObjRef[]>;

    /**
     * Attributes query factory.
     *
     * @returns attributes query
     */
    getAttributesQuery(): IAttributesQuery;
}

/**
 * Service to query attributes.
 *
 * @public
 */
export interface IAttributesQuery {
    /**
     * Sets number of attributes to return per page.
     * Default size: 50
     *
     * @param size - desired max number of attributes per page must be a positive number
     * @returns attributes query
     */
    withSize(size: number): IAttributesQuery;

    /**
     * Sets starting page for the query. Backend WILL return no data if the page is greater than
     * total number of pages.
     * Default page: 0
     *
     * @param page - zero indexed, must be non-negative
     * @returns attributes query
     */
    withPage(page: number): IAttributesQuery;

    /**
     * Sets filter for the query.
     *
     * @param filter - filter to apply
     * @returns attributes query
     */
    withFilter(filter: IFilterBaseOptions): IAttributesQuery;

    /**
     * Sets sorting for the query.
     *
     * @param sort - Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
     * @returns attributes query
     */
    withSorting(sort: string[]): IAttributesQuery;

    /**
     * Sets include for the query.
     *
     * @param include - include to apply
     * @returns attributes query
     */
    withInclude(include: string[]): IAttributesQuery;

    /**
     * Sets origin for the query.
     *
     * @param origin - origin to apply. This is an open string union to allow platform-specific origin values in addition to the built-in literals.
     * @returns attributes query
     */
    withOrigin(origin: ObjectOrigin | (string & {})): IAttributesQuery;

    /**
     * Selects which backend endpoint flavor to use when listing attributes.
     * Default method: "GET"
     *
     * @param method - endpoint flavor to use ("GET" or "POST")
     * @returns attributes query
     * @beta
     */
    withMethod(method: QueryMethod): IAttributesQuery;

    /**
     * Starts the query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IAttributesQueryResult>;
}

/**
 * Queried attributes are returned in a paged representation.
 *
 * @public
 */
export type IAttributesQueryResult = IPagedResource<IAttributeMetadataObject>;
