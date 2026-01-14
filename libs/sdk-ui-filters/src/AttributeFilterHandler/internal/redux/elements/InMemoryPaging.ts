// (C) 2022-2026 GoodData Corporation

import { invariant } from "ts-invariant";

import { type IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { type IAttributeElement } from "@gooddata/sdk-model";

// inspired by the same thing in sdk-backend-base, copied here to avoid the dependency
export class InMemoryPaging implements IElementsQueryResult {
    public readonly items: IAttributeElement[];
    public readonly limit: number;
    public readonly offset: number;
    public readonly totalCount: number;

    constructor(
        protected readonly allItems: IAttributeElement[],
        limit = 50,
        offset = 0,
    ) {
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

    public async next(): Promise<IElementsQueryResult> {
        if (this.items.length === 0) {
            return this;
        }

        return Promise.resolve(
            new InMemoryPaging(this.allItems, this.limit, this.offset + this.items.length),
        );
    }

    public async goTo(pageIndex: number): Promise<IElementsQueryResult> {
        if (this.items.length === 0) {
            return this;
        }

        return Promise.resolve(new InMemoryPaging(this.allItems, this.limit, pageIndex * this.items.length));
    }

    public async all(): Promise<IAttributeElement[]> {
        return Promise.resolve([...this.allItems]);
    }

    public async allSorted(
        compareFn: (a: IAttributeElement, b: IAttributeElement) => number,
    ): Promise<IAttributeElement[]> {
        return Promise.resolve([...this.allItems].sort(compareFn));
    }
}
