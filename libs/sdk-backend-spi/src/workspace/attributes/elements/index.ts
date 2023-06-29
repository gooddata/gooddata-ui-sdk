// (C) 2019-2023 GoodData Corporation
import {
    SortDirection,
    ObjRef,
    IAttributeFilter,
    IMeasure,
    IRelativeDateFilter,
    IAttributeElement,
} from "@gooddata/sdk-model";
import { IPagedResource } from "../../../common/paging.js";
import { ICancelable } from "../../../cancelation/index.js";

/**
 * Specification of particular elements to load in {@link IElementsQueryOptions} using their values.
 *
 * @public
 */
export interface IElementsQueryOptionsElementsByValue {
    /**
     * The values to request.
     */
    values: Array<string | null>;
}

/**
 * Type guard checking whether the object is an instance of {@link IElementsQueryOptionsElementsByValue}.
 *
 * @public
 */
export function isElementsQueryOptionsElementsByValue(
    obj: unknown,
): obj is IElementsQueryOptionsElementsByValue {
    return !!obj && !!(obj as IElementsQueryOptionsElementsByValue).values;
}

/**
 * Specification of particular elements to load in {@link IElementsQueryOptions} using the values of the primary
 * display form related to the attribute the requested display form is from.
 *
 * @public
 */
export interface IElementsQueryOptionsElementsByPrimaryDisplayFormValue {
    /**
     * The values to request.
     */
    primaryValues: Array<string | null>;
}

/**
 * Type guard checking whether the object is an instance of {@link IElementsQueryOptionsElementsByPrimaryDisplayFormValue}.
 *
 * @public
 */
export function isElementsQueryOptionsElementsByPrimaryDisplayFormValue(
    obj: unknown,
): obj is IElementsQueryOptionsElementsByPrimaryDisplayFormValue {
    return !!obj && !!(obj as IElementsQueryOptionsElementsByPrimaryDisplayFormValue).primaryValues;
}

/**
 * Type guard checking whether the object is an instance of {@link IElementsQueryOptionsElementsByValue} or {@link IElementsQueryOptionsElementsByPrimaryDisplayFormValue}.
 *
 * @public
 */
export function isValueBasedElementsQueryOptionsElements(
    obj: unknown,
): obj is IElementsQueryOptionsElementsByValue | IElementsQueryOptionsElementsByPrimaryDisplayFormValue {
    return (
        isElementsQueryOptionsElementsByValue(obj) ||
        isElementsQueryOptionsElementsByPrimaryDisplayFormValue(obj)
    );
}

/**
 * Specification of particular elements to load in {@link IElementsQueryOptions} using their URIs.
 *
 * @remarks
 * This is not supported on backends without the supportsElementUris capability.
 *
 * @public
 */
export interface IElementsQueryOptionsElementsByUri {
    /**
     * The element URIs to request.
     */
    uris: Array<string | null>;
}

/**
 * Specification of particular elements to load in {@link IElementsQueryOptions}.
 *
 * @public
 */
export type ElementsQueryOptionsElementsSpecification =
    | IElementsQueryOptionsElementsByValue
    | IElementsQueryOptionsElementsByPrimaryDisplayFormValue
    | IElementsQueryOptionsElementsByUri;

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
     * If true, the `filter` prop will behave negatively - i.e. it will not include items matching the `filter` value.
     */
    complement?: boolean;

    /**
     * Include the total count of all elements in the response (without filters applied)
     */
    includeTotalCountWithoutFilters?: boolean;

    /**
     * Specify particular elements to load.
     *
     * @remarks
     * This is commonly used to preload selected elements in the attribute filter.
     */
    elements?: ElementsQueryOptionsElementsSpecification;

    /**
     * Decides whether result will include also the primary label elements or only requested label ones.
     * It changes also the cardinality of result.
     *
     * If true, returned label values are in cardinality of primary label, i.e., result could contain
     * duplicated values.
     *
     * If false, returned label values are unique values and smaller amount of label values can be returned
     * than the number of primary label values.
     *
     * @remarks
     * This is used mainly in filters to not display duplicate values where each of them filter out the same
     * records from an insight when text value attribute filters are used.
     *
     * The value is applied only on backends without the supportsElementUris capability.
     */
    excludePrimaryLabel?: boolean;
}

/**
 * Attribute filter limiting the elements.
 *
 * @remarks
 * To be able to filter elements, the current attribute
 * and the filter attribute must be connected in the data model. The property `overAttribute` identifies
 * the connecting table in the logical data model.
 *
 * For method providing all possible connecting attributes see {@link IWorkspaceAttributesService.getCommonAttributes}.
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
export interface IElementsQuery extends ICancelable<IElementsQuery> {
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
