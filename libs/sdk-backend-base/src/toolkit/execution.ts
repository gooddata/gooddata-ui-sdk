// (C) 2019-2020 GoodData Corporation

import {
    AttributeOrMeasure,
    defaultDimensionsGenerator,
    defWithDimensions,
    IBucket,
    IExecutionDefinition,
    IFilter,
    IInsightDefinition,
    newDefForBuckets,
    newDefForInsight,
    newDefForItems,
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
    constructor(private readonly workspace: string) {}

    public abstract forDefinition(def: IExecutionDefinition): IPreparedExecution;
    public abstract forInsightByRef(uri: string, filters?: IFilter[]): Promise<IPreparedExecution>;

    public forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
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
}
