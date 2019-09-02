// (C) 2019 GoodData Corporation

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

    query(): IElementQueryResult;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IElementQueryResult {
    readonly elements: Element[];
    readonly limit: number;
    readonly offset: number;

    next(): IElementQueryResult;
}

/**
 * TODO: SDK8: add docs
 * @public
 */
export type Element = {
    readonly value: string;
    readonly uri?: string;
};
