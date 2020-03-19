// (C) 2019-2020 GoodData Corporation

/**
 * Interface to interact with paged asynchronous resources
 *
 * @public
 */
export interface IPagedResource<TItem> {
    readonly items: TItem[];
    readonly limit: number;
    readonly offset: number;
    readonly totalCount: number;

    /**
     * Request next page of the resource
     *
     * @returns promise of a paged resource with the results of next page
     */
    next(): Promise<IPagedResource<TItem>>;
}
