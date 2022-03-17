// (C) 2019-2022 GoodData Corporation
import { SortDirection, ObjRef, IAttributeFilter, IMeasure, IRelativeDateFilter } from "@gooddata/sdk-model";
import { IPagedResource } from "../../../common/paging";
import { IAttributeElement } from "../../fromModel/ldm/attributeElement";

/**
 * Configuration options for querying attribute elements
 *
 * @public
 */
export interface IElementsQueryOptions {
    /**
     * Ordering of the elements
     */
    order?: SortDirection;

    /**
     * Filter elements by text value
     */
    filter?: string;

    /**
     * TODO what is this doing?
     */
    prompt?: string;

    /**
     *  With this option you can specify concrete attribute elements uris to load.
     *  This is commonly used to preload selected elements in the attribute filter
     */
    uris?: string[];

    /**
     * If true, the `filter` prop will behave negatively - i.e. it will not include items matching the `filter` value.
     */
    complement?: boolean;

    /**
     * Include the total count of all elements in the response (without filters applied)
     */
    includeTotalCountWithoutFilters?: boolean;
}

/**
 * Attribute filter limiting the elements. To be able to filter elements, the current attribute
 * and the filter attribute must be connected in the data model. The property `overAttribute` identifies
 * the connecting table in the logical data model. For method providing all possible connecting attributes
 * see {@link IWorkspaceAttributesService.getCommonAttributes}.
 *
 * @public
 */

export interface IElementsQueryAttributeFilter {
    attributeFilter: IAttributeFilter;
    overAttribute: ObjRef;
}

/**
 * Only for these filter types makes sense to resolve their elements
 *
 * @public
 */
export type FilterWithResolvableElements = IAttributeFilter | IRelativeDateFilter;

/**
 * The attribute itself contains no view data, it's just a sequence of id's.
 *
 * @remarks
 * To get data that is useful to users, we need to represent these id's with specific values.
 * For this purpose, we pair the attribute with it's display form (specific representation of attribute values).
 * An attribute can have multiple display forms.
 *
 * @public
 */
export interface IElementsQueryFactory {
    /**
     * Query attribute elements represented by concrete display form
     *
     * @param ref - display form ref
     * @returns instance that can be used to query attribute elements
     */
    forDisplayForm(ref: ObjRef): IElementsQuery;

    /**
     * Query attribute elements used by provided filter
     *
     * @param filter - resolvable filter
     * @param dateFilterDisplayForm - display form of resolvable filter if it is date filter
     * @returns instance that can be used to query attribute elements
     *
     */
    forFilter(filter: FilterWithResolvableElements, dateFilterDisplayForm?: ObjRef): IFilterElementsQuery;
}

/**
 * Service to query valid attribute elements for particular display form.
 *
 * @public
 */
export interface IElementsQuery {
    /**
     * Sets number of valid elements to return per page.
     * Default limit is specific per backend
     *
     * @param limit - desired max number of valid elements per page; must be a positive number
     * @returns element query
     */
    withLimit(limit: number): IElementsQuery;

    /**
     * Sets starting point for the query. Backend WILL return no data if the offset is greater than
     * total number of valid elements.
     * Default offset: 0
     *
     * @param offset - zero indexed, must be non-negative
     * @returns element query
     */
    withOffset(offset: number): IElementsQuery;

    /**
     * Sets the attribute filters that will limit the available elements
     *
     * @param filters - attribute filters limiting the elements
     * @returns element query
     */
    withAttributeFilters(filters: IElementsQueryAttributeFilter[]): IElementsQuery;

    /**
     * Sets the measures that will limit the available elements - only elements for which the measures
     * have data will be returned.
     *
     * @param measures - measures limiting the elements
     * @returns element query
     */
    withMeasures(measures: IMeasure[]): IElementsQuery;

    /**
     * Allows to specify advanced options for the elements query.
     *
     * @param options - advanced options
     * @returns element query
     */
    withOptions(options: IElementsQueryOptions): IElementsQuery;

    /**
     * Starts the valid elements query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IElementsQueryResult>;

    /**
     * Sets the date filters that will limit the available elements
     *
     * @param filters - date filters limiting the elements
     * @returns element query
     */

    // will add relativeDateFilters
    withDateFilters(filters: IRelativeDateFilter[]): IElementsQuery;
}

/**
 * Service to query valid filter elements for particular filter.
 *
 * @public
 */
export interface IFilterElementsQuery {
    /**
     * Sets number of valid elements to return per page.
     * Default limit is specific per backend
     *
     * @param limit - desired max number of valid elements per page; must be a positive number
     * @returns element query
     */
    withLimit(limit: number): IFilterElementsQuery;

    /**
     * Sets starting point for the query. Backend WILL return no data if the offset is greater than
     * total number of valid elements.
     * Default offset: 0
     *
     * @param offset - zero indexed, must be non-negative
     * @returns element query
     */
    withOffset(offset: number): IFilterElementsQuery;

    /**
     * Starts the valid elements query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IElementsQueryResult>;
}

/**
 * Paged result of valid element query. Last page of data returns empty items.
 *
 * @public
 */
export type IElementsQueryResult = IPagedResource<IAttributeElement>;
