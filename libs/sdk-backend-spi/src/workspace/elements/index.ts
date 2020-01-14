// (C) 2019-2020 GoodData Corporation
import { SortDirection, IAttributeElement, ObjRef } from "@gooddata/sdk-model";
import { IPagedResource } from "../../common/paging";

/**
 * @alpha
 */
export interface IElementQueryOptions {
    // TODO: revisit if we really need all of these options
    order?: SortDirection;
    filter?: string;
    prompt?: string;
    uris?: string[];
    complement?: boolean;
    includeTotalCountWithoutFilters?: boolean;
    restrictiveDefinition?: string;
    restrictiveDefinitionContent?: object;
    // afm?: GdcExecuteAFM.IAfm; // TODO: do we really need this? if so, we should add support for using executionDefinition here
}

/**
 * Factory for valid element queries.
 *
 * @public
 */
export interface IElementQueryFactory {
    /**
     * Creates query for valid elements of display form with the provided identifier.
     * @param ref - display form ref
     */
    forDisplayForm(ref: ObjRef): IElementQuery;
}

/**
 * Customizable, paged valid elements query for particular display form.
 *
 * @public
 */
export interface IElementQuery {
    /**
     * Sets number of valid elements to return per page.
     *
     * @param limit - desired max number of valid elements per page; must be a positive number
     */
    withLimit(limit: number): IElementQuery;

    /**
     * Sets starting point for the query. Backend WILL return no data if the offset is greater than
     * total number of valid elements.
     *
     * @param offset - zero indexed, must be non-negative
     */
    withOffset(offset: number): IElementQuery;

    /**
     * Allows to specify advanced options for the elements query.
     *
     * @param options - advanced options
     * @alpha
     */
    withOptions(options: IElementQueryOptions): IElementQuery;

    /**
     * Starts the valid elements query.
     *
     * @returns first page of the results
     */
    query(): Promise<IElementQueryResult>;
}

/**
 * Paged result of valid element query. Last page of data returns empty items.
 *
 * @public
 */
export interface IElementQueryResult extends IPagedResource<IAttributeElement> {}
