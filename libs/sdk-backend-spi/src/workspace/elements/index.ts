// (C) 2019-2020 GoodData Corporation
import { SortDirection, IAttributeElement, ObjRef, IAttributeFilter } from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging";

/**
 * Configuration options for querying attribute elements
 *
 * @public
 */
export interface IElementQueryOptions {
    /**
     * Ordering of the elements
     */
    order?: SortDirection;

    /**
     * Filter elements by text value
     */
    filter?: string;

    /**
     * TO-DO what is this doing?
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

    /**
     * TODO what is this doing?
     */
    restrictiveDefinition?: string;

    /**
     * TODO what is this doing?
     */
    restrictiveDefinitionContent?: object;

    /**
     * TODO is it necessary?
     */
    // afm?: GdcExecuteAFM.IAfm; // TODO: do we really need this? if so, we should add support for using executionDefinition here
}

/**
 * Attribute filter limiting the elements. To be able to filter elements, the current attribute
 * and the filter attribute must be connected in the data model. The property "overAttribute" identifies
 * the connecting table in the logical data model. For method providing all possible connecting attributes
 * see "getCommonAttributes"
 *
 * @public
 */

export interface IElementQueryAttributeFilter {
    attributeFilter: IAttributeFilter;
    overAttribute: ObjRef;
}

/**
 * The attribute itself contains no view data, it's just a sequence of id's.
 * To get data that is useful to users, we need to represent these id's with specific values.
 * For this purpose, we pair the attribute with it's display form (specific representation of attribute values).
 * An attribute can have multiple display forms.
 *
 * @public
 */
export interface IElementQueryFactory {
    /**
     * Query attribute elements represented by concrete display form
     *
     * @param ref - display form ref
     * @returns instance that can be used to query attribute elements
     */
    forDisplayForm(ref: ObjRef): IElementQuery;
}

/**
 * Service to query valid attribute elements for particular display form.
 *
 * @public
 */
export interface IElementQuery {
    /**
     * Sets number of valid elements to return per page.
     * Default limit is specific per backend
     *
     * @param limit - desired max number of valid elements per page; must be a positive number
     * @returns element query
     */
    withLimit(limit: number): IElementQuery;

    /**
     * Sets starting point for the query. Backend WILL return no data if the offset is greater than
     * total number of valid elements.
     * Default offset: 0
     *
     * @param offset - zero indexed, must be non-negative
     * @returns element query
     */
    withOffset(offset: number): IElementQuery;

    /**
     * Sets the attribute filters that will limit the available elements
     *
     * @param attributeRef - corresponding attribute to the current display form (specified in forDisplayForm)
     * @param filters - attribute filters limiting the elements
     */
    withAttributeFilters(attributeRef: ObjRef, filters: IElementQueryAttributeFilter[]): IElementQuery;

    /**
     * Allows to specify advanced options for the elements query.
     *
     * @param options - advanced options
     * @returns element query
     */
    withOptions(options: IElementQueryOptions): IElementQuery;

    /**
     * Starts the valid elements query.
     *
     * @returns promise of first page of the results
     */
    query(): Promise<IElementQueryResult>;
}

/**
 * Paged result of valid element query. Last page of data returns empty items.
 *
 * @public
 */
export type IElementQueryResult = IPagedResource<IAttributeElement>;
