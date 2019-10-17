// (C) 2019 GoodData Corporation
import { SortDirection } from "@gooddata/sdk-model";

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IElementQueryOptions {
    order?: SortDirection;
    filter?: string;
    prompt?: string;
    uris?: string[];
    complement?: boolean;
    includeTotalCountWithoutFilters?: boolean;
    restrictiveDefinition?: string;
    restrictiveDefinitionContent?: object;
    // afm?: ExecuteAFM.IAfm; // TODO what should we do with this?
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
    readonly elements: Element[];
    readonly limit: number;
    readonly offset: number;

    next(): Promise<IElementQueryResult>;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export type Element = {
    readonly value: string;
    readonly uri?: string;
};
