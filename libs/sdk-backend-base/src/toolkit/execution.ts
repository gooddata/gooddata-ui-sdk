// (C) 2019-2025 GoodData Corporation

import {
    IAttributeOrMeasure,
    defaultDimensionsGenerator,
    defWithDimensions,
    IBucket,
    IExecutionDefinition,
    IInsightDefinition,
    newDefForBuckets,
    newDefForInsight,
    newDefForItems,
    IInsight,
    isInsight,
    INullableFilter,
} from "@gooddata/sdk-model";

import { IExecutionFactory, IPreparedExecution, IPreparedExecutionOptions } from "@gooddata/sdk-backend-spi";
import { DecoratedExecutionFactory } from "../decoratedBackend/execution.js";

/**
 * Abstract base class that can be extended to implement concrete execution factories for different
 * backend implementations.
 *
 * This class implements the convenience methods which do not need to change in implementations.
 *
 * Note: the `forInsightByRef` is implemented as fallback to freeform execution done by `forInsight`. The
 * rationale is that most backends do not support that anyway so it is a safe default behavior. If the backend
 * supports execute-by-reference, then overload the method with your own implementation
 *
 * @internal
 */
export abstract class AbstractExecutionFactory implements IExecutionFactory {
    constructor(protected readonly workspace: string) {}

    public abstract forDefinition(
        def: IExecutionDefinition,
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution;

    public forItems(
        items: IAttributeOrMeasure[],
        filters?: INullableFilter[],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        const def = defWithDimensions(
            newDefForItems(this.workspace, items, filters),
            defaultDimensionsGenerator,
        );

        return this.forDefinition(def, options);
    }

    public forBuckets(
        buckets: IBucket[],
        filters?: INullableFilter[],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        const def = defWithDimensions(
            newDefForBuckets(this.workspace, buckets, filters),
            defaultDimensionsGenerator,
        );

        return this.forDefinition(def, options);
    }

    public forInsight(
        insight: IInsightDefinition,
        filters?: INullableFilter[],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        const def = defWithDimensions(
            newDefForInsight(this.workspace, insight, filters),
            defaultDimensionsGenerator,
        );

        return this.forDefinition(def, options);
    }

    public forInsightByRef(
        insight: IInsight,
        filters?: INullableFilter[],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        return this.forInsight(insight, filters, options);
    }
}

/**
 * This implementation of execution factory allows transparent injection of fixed set of filters to all
 * executions started through it.
 *
 * This factory will not perform any filter merging. All it does is ensure some filters are always passed
 * to the underlying factory. The responsibility to do the filter merging lies in the underlying factory.
 *
 * @internal
 */
export class ExecutionFactoryWithFixedFilters extends DecoratedExecutionFactory {
    constructor(decorated: IExecutionFactory, private readonly filters: INullableFilter[] = []) {
        super(decorated);
    }

    public forItems(
        items: IAttributeOrMeasure[],
        filters: INullableFilter[] = [],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        return super.forItems(items, this.filters.concat(filters), options);
    }

    public forBuckets(
        buckets: IBucket[],
        filters: INullableFilter[] = [],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        return super.forBuckets(buckets, this.filters.concat(filters), options);
    }

    public forInsight(
        insight: IInsightDefinition,
        filters: INullableFilter[] = [],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        return super.forInsight(insight, this.filters.concat(filters), options);
    }

    public forInsightByRef(
        insight: IInsight,
        filters: INullableFilter[] = [],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        return super.forInsightByRef(insight, this.filters.concat(filters), options);
    }
}

/**
 * This implementation of execution factory will transparently upgrade any `forInsight` execution
 * to `forInsightByRef` execution IF the argument to `forInsight` is actually a persisted insight (`IInsight` which
 * is subtype of `IInsightDefinition`).
 *
 * @internal
 */
export class ExecutionFactoryUpgradingToExecByReference extends DecoratedExecutionFactory {
    constructor(decorated: IExecutionFactory) {
        super(decorated);
    }

    public forInsight(
        insight: IInsightDefinition,
        filters?: INullableFilter[],
        options?: IPreparedExecutionOptions,
    ): IPreparedExecution {
        if (isInsight(insight)) {
            return this.forInsightByRef(insight, filters, options);
        }

        return super.forInsight(insight, filters, options);
    }
}
