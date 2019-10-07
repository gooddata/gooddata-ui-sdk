// (C) 2019 GoodData Corporation

import {
    defForBuckets,
    defForInsight,
    defForItems,
    IExecutionFactory,
    IPreparedExecution,
    NotImplemented,
} from "@gooddata/sdk-backend-spi";
import { AttributeOrMeasure, IBucket, IFilter, IInsight, IExecutionDefinition } from "@gooddata/sdk-model";
import { AuthenticatedSdkProvider } from "./commonTypes";
import { BearPreparedExecution } from "./preparedExecution";

export class BearExecution implements IExecutionFactory {
    constructor(private readonly authSdk: AuthenticatedSdkProvider, private readonly workspace: string) {}

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return new BearPreparedExecution(this.authSdk, def, this);
    }

    public forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
        const def = defForItems(this.workspace, items, filters);

        return this.forDefinition(def);
    }

    public forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
        const def = defForBuckets(this.workspace, buckets, filters);

        return this.forDefinition(def);
    }

    public forInsight(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
        const def = defForInsight(this.workspace, insight, filters);

        return this.forDefinition(def);
    }

    public forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
        throw new NotImplemented("execution by uri reference not yet implemented");
    }
}
