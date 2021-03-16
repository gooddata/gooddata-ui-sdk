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

    constructor(private readonly all: T[], limit = 50, offset = 0) {
        invariant(offset >= 0, `paging offset must be non-negative, got: ${offset}`);
        invariant(limit > 0, `limit must be a positive number, got: ${limit}`);

        // this will naturally return empty items if at the end of data; limit will always be positive
        this.items = all.slice(offset, offset + limit);

        // offset is at most at the end of all available elements
        this.offset = Math.min(offset, all.length);
        // limit is capped to size of current page

        this.limit = Math.max(limit, this.items.length);

        this.totalCount = all.length;
    }

    public async next(): Promise<IPagedResource<T>> {
        if (this.items.length === 0) {
            return this;
        }

        return new InMemoryPaging(this.all, this.limit, this.offset + this.items.length);
    }
}
