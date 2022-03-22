// (C) 2019-2022 GoodData Corporation

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

    /**
     * Request a specific page of the resource
     *
     * @param pageIndex - index of requested page: positive, zero-based
     * @returns promise of a paged resource with the results of selected page
     */
    goTo(pageIndex: number): Promise<IPagedResource<TItem>>;

    /**
     * Request all the pages merged in a single array.
     *
     * @remarks
     * This MUST respect all the original query settings except for the paging settings (e.g. offset, limit).
     *
     * @returns promise of an array for all the pages' contents in one array
     */
    all(): Promise<TItem[]>;

    /**
     * Request all the pages merged in a single array and sort them using the given comparator.
     *
     * @remarks
     * This MUST respect all the original query settings except for the paging settings (e.g. offset, limit).
     *
     * @param compareFn - the compare function to use - the semantics are the same os for the Array.sort parameter
     *
     * @returns promise of an array for all the pages' contents in one array
     */
    allSorted(compareFn: (a: TItem, b: TItem) => number): Promise<TItem[]>;
}
