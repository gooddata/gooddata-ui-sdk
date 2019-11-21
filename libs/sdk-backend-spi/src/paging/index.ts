// (C) 2019 GoodData Corporation

/**
 * TODO: SDK8: add docs
 * @public
 */
export interface IPagedResource<TItem> {
    readonly items: TItem[];
    readonly limit: number;
    readonly offset: number;
    readonly totalCount: number;

    next(): Promise<IPagedResource<TItem>>;
}
