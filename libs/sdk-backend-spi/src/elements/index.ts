// (C) 2019 GoodData Corporation
import { SortDirection } from "@gooddata/sdk-model";

/**
 * TODO: SDK8: add docs
 * @public
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
    // afm?: ExecuteAFM.IAfm; // TODO: do we really need this? if so, we should add support for using executionDefinition here
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IElementQueryFactory {
    forObject(objectId: string): IElementQuery;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IElementQuery {
    withLimit(limit: number): IElementQuery;

    withOffset(offset: number): IElementQuery;

    withOptions(options: IElementQueryOptions): IElementQuery;

    query(): Promise<IElementQueryResult>;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IElementQueryResult {
    readonly elements: IElement[];
    readonly limit: number;
    readonly offset: number;
    readonly totalCount: number;

    next(): Promise<IElementQueryResult>;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IElement {
    readonly title: string;
    readonly uri?: string;
}
