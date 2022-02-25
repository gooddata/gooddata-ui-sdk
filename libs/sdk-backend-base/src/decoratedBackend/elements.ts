// (C) 2021-2022 GoodData Corporation

import {
    IElementsQuery,
    IElementsQueryFactory,
    FilterWithResolvableElements,
    IFilterElementsQuery,
    IElementsQueryAttributeFilter,
    IElementsQueryOptions,
    IElementsQueryResult,
    IAttributeElement,
    IPagedResource,
} from "@gooddata/sdk-backend-spi";
import { IMeasure, IRelativeDateFilter, ObjRef } from "@gooddata/sdk-model";

/**
 * @alpha
 */
export abstract class DecoratedElementsQueryFactory implements IElementsQueryFactory {
    protected constructor(protected readonly decorated: IElementsQueryFactory) {}

    public forDisplayForm(ref: ObjRef): IElementsQuery {
        return this.decorated.forDisplayForm(ref);
    }

    public forFilter(
        filter: FilterWithResolvableElements,
        dateFilterDisplayForm?: ObjRef,
    ): IFilterElementsQuery {
        return this.decorated.forFilter(filter, dateFilterDisplayForm);
    }
}

/**
 * @alpha
 */
export abstract class DecoratedElementsQuery implements IElementsQuery {
    protected constructor(
        protected readonly decorated: IElementsQuery,
        protected readonly settings: {
            limit?: number;
            offset?: number;
            options?: IElementsQueryOptions;
            attributeFilters?: IElementsQueryAttributeFilter[];
            dateFilters?: IRelativeDateFilter[];
            measures?: IMeasure[];
        } = {},
    ) {}

    public withLimit(limit: number): IElementsQuery {
        return this.createNew(this.decorated.withLimit(limit), {
            ...this.settings,
            limit,
        });
    }

    public withOffset(offset: number): IElementsQuery {
        return this.createNew(this.decorated.withOffset(offset), {
            ...this.settings,
            offset,
        });
    }

    public withAttributeFilters(attributeFilters: IElementsQueryAttributeFilter[]): IElementsQuery {
        return this.createNew(this.decorated.withAttributeFilters(attributeFilters), {
            ...this.settings,
            attributeFilters,
        });
    }

    public withMeasures(measures: IMeasure[]): IElementsQuery {
        return this.createNew(this.decorated.withMeasures(measures), {
            ...this.settings,
            measures,
        });
    }

    public withOptions(options: IElementsQueryOptions): IElementsQuery {
        return this.createNew(this.decorated.withOptions(options), {
            ...this.settings,
            options,
        });
    }

    public query(): Promise<IElementsQueryResult> {
        return this.decorated.query();
    }

    public withDateFilters(dateFilters: IRelativeDateFilter[]): IElementsQuery {
        return this.createNew(this.decorated.withDateFilters(dateFilters), {
            ...this.settings,
            dateFilters,
        });
    }

    protected abstract createNew(
        decorated: IElementsQuery,
        settings: {
            limit?: number;
            offset?: number;
            options?: IElementsQueryOptions;
            attributeFilters?: IElementsQueryAttributeFilter[];
            dateFilters?: IRelativeDateFilter[];
            measures?: IMeasure[];
        },
    ): IElementsQuery;
}

/**
 * @alpha
 */
export abstract class DecoratedElementsQueryResult implements IElementsQueryResult {
    protected constructor(
        protected readonly decorated: IElementsQueryResult,
        public readonly items: IAttributeElement[],
        public readonly limit: number,
        public readonly offset: number,
        public readonly totalCount: number,
    ) {}

    public async next(): Promise<IPagedResource<IAttributeElement>> {
        const result = await this.decorated.next();
        return this.createNew(result, result.items, result.limit, result.offset, result.totalCount);
    }
    public async goTo(pageIndex: number): Promise<IPagedResource<IAttributeElement>> {
        const result = await this.decorated.goTo(pageIndex);
        return this.createNew(result, result.items, result.limit, result.offset, result.totalCount);
    }
    public all(): Promise<IAttributeElement[]> {
        return this.decorated.all();
    }

    public allSorted(
        compareFn: (a: IAttributeElement, b: IAttributeElement) => number,
    ): Promise<IAttributeElement[]> {
        return this.decorated.allSorted(compareFn);
    }

    protected abstract createNew(
        decorated: IElementsQueryResult,
        items: IAttributeElement[],
        limit: number,
        offset: number,
        totalCount: number,
    ): IElementsQueryResult;
}
