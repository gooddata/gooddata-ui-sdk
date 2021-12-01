// (C) 2019-2021 GoodData Corporation
import { IPagedResource } from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";

/**
 * This implementation of {@link @gooddata/sdk-backend-spi#IPagedResource} pages over a list of items
 * provided at construction time. The paging is done using pre-configured page limit and starts at particular offset.
 *
 * @internal
 */
export class InMemoryPaging<T> implements IPagedResource<T> {
    public readonly items: T[];
    public readonly limit: number;
    public readonly offset: number;
    public readonly totalCount: number;

    constructor(protected readonly allItems: T[], limit = 50, offset = 0) {
        invariant(offset >= 0, `paging offset must be non-negative, got: ${offset}`);
        invariant(limit > 0, `limit must be a positive number, got: ${limit}`);

        // this will naturally return empty items if at the end of data; limit will always be positive
        this.items = allItems.slice(offset, offset + limit);

        // offset is at most at the end of all available elements
        this.offset = Math.min(offset, allItems.length);
        // limit is always kept as-requested
        this.limit = limit;

        this.totalCount = allItems.length;
    }

    public async next(): Promise<IPagedResource<T>> {
        if (this.items.length === 0) {
            return this;
        }

        return new InMemoryPaging(this.allItems, this.limit, this.offset + this.items.length);
    }

    public async goTo(pageIndex: number): Promise<IPagedResource<T>> {
        if (this.items.length === 0) {
            return this;
        }

        return new InMemoryPaging(this.allItems, this.limit, pageIndex * this.items.length);
    }

    public async all(): Promise<T[]> {
        return [...this.allItems];
    }

    public async allSorted(compareFn: (a: T, b: T) => number): Promise<T[]> {
        return [...this.allItems].sort(compareFn);
    }
}

/**
 * @internal
 */
export interface IServerPagingResult<T> {
    items: T[];
    totalCount: number;
}

/**
 * @internal
 */
export type IServerPagingParams = {
    offset: number;
    limit: number;
};

/**
 * Common implementation of the {@link @gooddata/sdk-backend-spi#IPagedResource} for the server-side paging.
 *
 * @internal
 */
export class ServerPaging<T> implements IPagedResource<T> {
    public static async for<TItem>(
        getData: (pagingParams: IServerPagingParams) => Promise<IServerPagingResult<TItem>>,
        limit = 50,
        offset = 0,
    ): Promise<IPagedResource<TItem>> {
        invariant(offset >= 0, `paging offset must be non-negative, got: ${offset}`);
        invariant(limit > 0, `limit must be a positive number, got: ${limit}`);
        const { totalCount, items } = await getData({ limit, offset });
        invariant(totalCount, `total count must be specified, got: ${totalCount}`);
        return new ServerPaging(getData, limit, offset, totalCount, items);
    }

    constructor(
        protected readonly getData: (pagingParams: IServerPagingParams) => Promise<IServerPagingResult<T>>,
        public readonly limit = 50,
        public readonly offset = 0,
        public readonly totalCount: number,
        public readonly items: T[],
    ) {
        this.offset = Math.min(totalCount, offset);
    }

    public async next(): Promise<IPagedResource<T>> {
        // No items = we are on the last page.
        if (this.items.length === 0) {
            return this;
        }

        const pageData = await this.getData({ limit: this.limit, offset: this.offset + this.limit });
        return new ServerPaging(
            this.getData,
            this.limit,
            this.offset + this.limit,
            this.totalCount,
            pageData.items,
        );
    }

    public async goTo(pageIndex: number): Promise<IPagedResource<T>> {
        const offset = pageIndex * this.limit;
        const pageData = await this.getData({ limit: this.limit, offset });
        return new ServerPaging(this.getData, this.limit, offset, this.totalCount, pageData.items);
    }

    public async all(): Promise<T[]> {
        const results: T[] = [];
        const pageSize = this.limit;
        // if the paged resource is already at the 0 offset, use it directly to save a duplicate request
        let currentPage = this.offset !== 0 ? await this.goTo(0) : this;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            results.push(...currentPage.items);

            if (currentPage.items.length < pageSize) {
                return results;
            }
            currentPage.items.sort();

            currentPage = await currentPage.next();
        }
    }

    public async allSorted(compareFn: (a: T, b: T) => number): Promise<T[]> {
        const all = await this.all();
        return all.sort(compareFn);
    }
}

/**
 * Given a paged result, this function will retrieve all pages from the backend concatenated to a single array.
 *
 * @param pagedResource - the paged resource to get all the pages of
 */
async function getAllPagesOfInner<T>(
    pagedResource: Omit<IPagedResource<T>, "all" | "allSorted">,
): Promise<T[]> {
    const results: T[] = [];
    const pageSize = pagedResource.limit;
    // if the paged resource is already at the 0 offset, use it directly to save a duplicate request
    let currentPage = pagedResource.offset !== 0 ? await pagedResource.goTo(0) : pagedResource;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        results.push(...currentPage.items);

        if (currentPage.items.length < pageSize) {
            return results;
        }
        currentPage.items.sort();

        currentPage = await currentPage.next();
    }
}

/**
 * Given a paged result, this function will enhance it with the `all` implementation.
 *
 * @remarks TODO: FET-847 avoid the need for this function
 *
 * @param pagedResource - paged resource to enhance
 * @internal
 */
export function enhanceWithAll<TItem, TResource extends Omit<IPagedResource<TItem>, "all" | "allSorted">>(
    pagedResource: TResource,
): TResource & IPagedResource<TItem> {
    return {
        ...pagedResource,
        all: () => getAllPagesOfInner(pagedResource),
        allSorted: (compareFn) => getAllPagesOfInner(pagedResource).then((items) => items.sort(compareFn)),
    };
}
