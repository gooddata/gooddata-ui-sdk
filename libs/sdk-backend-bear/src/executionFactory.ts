// (C) 2019 GoodData Corporation

import { IExecutionFactory, IPreparedExecution, NotImplemented } from "@gooddata/sdk-backend-spi";
import {
    AttributeOrMeasure,
    defaultDimensionsGenerator,
    defWithDimensions,
    IBucket,
    IExecutionDefinition,
    IFilter,
    IInsight,
    newDefForBuckets,
    newDefForInsight,
    newDefForItems,
} from "@gooddata/sdk-model";
import { AuthenticatedCallGuard } from "./commonTypes";
import { BearPreparedExecution } from "./preparedExecution";

export class BearExecution implements IExecutionFactory {
    constructor(private readonly authCall: AuthenticatedCallGuard, private readonly workspace: string) {}

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return new BearPreparedExecution(this.authCall, def, this);
    }

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

    public forInsight(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
        const def = defWithDimensions(
            newDefForInsight(this.workspace, insight, filters),
            defaultDimensionsGenerator,
        );

        return this.forDefinition(def);
    }

    public forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
        throw new NotImplemented("execution by uri reference not yet implemented");
    }
}
