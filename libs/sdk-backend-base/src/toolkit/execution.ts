// (C) 2019-2020 GoodData Corporation

import {
    IAttributeOrMeasure,
    defaultDimensionsGenerator,
    defWithDimensions,
    IBucket,
    IExecutionDefinition,
    IFilter,
    IInsightDefinition,
    newDefForBuckets,
    newDefForInsight,
    newDefForItems,
    IInsight,
} from "@gooddata/sdk-model";

import { IExecutionFactory, IPreparedExecution } from "@gooddata/sdk-backend-spi";

/**
 * Abstract base class that can be extended to implement concrete execution factories for different
 * backend implementations.
 *
 * This class implements the convenience methods which do not need to change in implementations.
 *
 * @internal
 */
export abstract class AbstractExecutionFactory implements IExecutionFactory {
    constructor(protected readonly workspace: string) {}

    public abstract forDefinition(def: IExecutionDefinition): IPreparedExecution;

    public forItems(items: IAttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
        const def = defWithDimensions(
            newDefForItems(this.workspace, items, filters),
            defaultDimensionsGenerator,
        );

        return this.forDefinition(def);
    }

    public forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
        const def = defWithDimensions(
            newDefForBuckets(this.workspace, buckets, filters),
            defaultDimensionsGenerator,
        );

        return this.forDefinition(def);
    }

    public forInsight(insight: IInsightDefinition, filters?: IFilter[]): IPreparedExecution {
        const def = defWithDimensions(
            newDefForInsight(this.workspace, insight, filters),
            defaultDimensionsGenerator,
        );

        return this.forDefinition(def);
    }

    public forInsightByRef(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
        return this.forInsight(insight, filters);
    }
}
