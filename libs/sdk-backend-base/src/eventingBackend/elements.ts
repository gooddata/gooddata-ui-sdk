// (C) 2007-2022 GoodData Corporation
import {
    IAttributeElement,
    IElementsQuery,
    IElementsQueryAttributeFilter,
    IElementsQueryFactory,
    IElementsQueryOptions,
    IElementsQueryResult,
    IPagedResource,
} from "@gooddata/sdk-backend-spi";
import { IMeasure, IRelativeDateFilter, ObjRef } from "@gooddata/sdk-model";
import {
    DecoratedElementsQuery,
    DecoratedElementsQueryFactory,
    DecoratedElementsQueryResult,
} from "../decoratedBackend/elements";
import { AnalyticalBackendCallbacks } from "./types";

export class WithElementsQueryFactoryEventing extends DecoratedElementsQueryFactory {
    constructor(
        protected readonly decorated: IElementsQueryFactory,
        private readonly callbacks: AnalyticalBackendCallbacks,
    ) {
        super(decorated);
    }

    public forDisplayForm(ref: ObjRef): IElementsQuery {
        return new WithElementsQueryEventing(this.decorated.forDisplayForm(ref), this.callbacks, ref);
    }
}

/**
 * @alpha
 */
export class WithElementsQueryEventing extends DecoratedElementsQuery {
    constructor(
        protected readonly decorated: IElementsQuery,
        private readonly callbacks: AnalyticalBackendCallbacks,
        private readonly displayFormRef: ObjRef,
        protected readonly settings: {
            limit?: number;
            offset?: number;
            options?: IElementsQueryOptions;
            attributeFilters?: IElementsQueryAttributeFilter[];
            dateFilters?: IRelativeDateFilter[];
            measures?: IMeasure[];
        } = {},
    ) {
        super(decorated, settings);
    }

    public async query(): Promise<IElementsQueryResult> {
        const result = await super.query();
        this.callbacks?.elements?.displayFormElementsQuery?.({
            ref: this.displayFormRef,
            ...this.settings,
        });

        // what about paging etc?
        return new WithElementsQueryResultEventing(
            result,
            this.displayFormRef,
            this.callbacks,
            {
                attributeFilters: this.settings.attributeFilters,
                dateFilters: this.settings.dateFilters,
                measures: this.settings.measures,
                options: this.settings.options,
            },
            result.items,
            result.limit,
            result.offset,
            result.totalCount,
        );
    }

    public withLimit(limit: number): IElementsQuery {
        return super.withLimit(limit);
    }

    public withOffset(offset: number): IElementsQuery {
        return super.withOffset(offset);
    }

    public withAttributeFilters(attributeFilters: IElementsQueryAttributeFilter[]): IElementsQuery {
        return super.withAttributeFilters(attributeFilters);
    }

    public withMeasures(measures: IMeasure[]): IElementsQuery {
        return super.withMeasures(measures);
    }

    public withDateFilters(dateFilters: IRelativeDateFilter[]): IElementsQuery {
        return super.withDateFilters(dateFilters);
    }

    public withOptions(options: IElementsQueryOptions): IElementsQuery {
        return super.withOptions(options);
    }

    protected createNew = (
        decorated: IElementsQuery,
        settings: {
            limit?: number;
            offset?: number;
            options?: IElementsQueryOptions;
            attributeFilters?: IElementsQueryAttributeFilter[];
            dateFilters?: IRelativeDateFilter[];
            measures?: IMeasure[];
        },
    ): IElementsQuery => {
        return new WithElementsQueryEventing(decorated, this.callbacks, this.displayFormRef, settings);
    };
}

/**
 * @alpha
 */
export class WithElementsQueryResultEventing extends DecoratedElementsQueryResult {
    constructor(
        protected readonly decorated: IElementsQueryResult,
        private readonly displayFormRef: ObjRef,
        private readonly callbacks: AnalyticalBackendCallbacks,
        private readonly additionalSettings: {
            options?: IElementsQueryOptions;
            attributeFilters?: IElementsQueryAttributeFilter[];
            dateFilters?: IRelativeDateFilter[];
            measures?: IMeasure[];
        },
        public items: IAttributeElement[],
        public limit: number,
        public offset: number,
        public totalCount: number,
    ) {
        super(decorated, items, limit, offset, totalCount);
    }

    public next(): Promise<IPagedResource<IAttributeElement>> {
        return super.next();
    }
    public goTo(pageIndex: number): Promise<IPagedResource<IAttributeElement>> {
        return super.goTo(pageIndex);
    }

    public all(): Promise<IAttributeElement[]> {
        return super.all();
    }

    public allSorted(
        compareFn: (a: IAttributeElement, b: IAttributeElement) => number,
    ): Promise<IAttributeElement[]> {
        return super.allSorted(compareFn);
    }

    protected createNew = (
        decorated: IElementsQueryResult,
        items: IAttributeElement[],
        limit: number,
        offset: number,
        totalCount: number,
    ): IElementsQueryResult => {
        this.callbacks?.elements?.displayFormElementsQueryPage?.({
            ref: this.displayFormRef,
            limit,
            offset,
            options: this.additionalSettings.options,
            attributeFilters: this.additionalSettings.attributeFilters,
            dateFilters: this.additionalSettings.dateFilters,
            measures: this.additionalSettings.measures,
        });
        return new WithElementsQueryResultEventing(
            decorated,
            this.displayFormRef,
            this.callbacks,
            this.additionalSettings,
            items,
            limit,
            offset,
            totalCount,
        );
    };
}
