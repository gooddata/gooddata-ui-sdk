// (C) 2019 GoodData Corporation

import { IExecutionFactory, IPreparedExecution, NotImplemented } from "@gooddata/sdk-backend-spi";
import { AttributeOrMeasure, IBucket, IFilter, IInsight } from "@gooddata/sdk-model";
import { defWithFilters, newDefFromBuckets, newDefFromInsight, newDefFromItems } from "./executionDefinition";
import { IAuthenticatedSdkProvider } from "./commonTypes";
import { BearPreparedExecution } from "./preparedExecution";

export class BearExecution implements IExecutionFactory {
    constructor(private readonly authSdk: IAuthenticatedSdkProvider, private readonly workspace: string) {}

    public forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
        const def = defWithFilters(newDefFromBuckets(this.workspace, buckets), filters);

        return new BearPreparedExecution(this.authSdk, def);
    }

    public forInsight(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
        const def = defWithFilters(newDefFromInsight(this.workspace, insight), filters);

        return new BearPreparedExecution(this.authSdk, def);
    }

    public forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
        const def = defWithFilters(newDefFromItems(this.workspace, items), filters);

        return new BearPreparedExecution(this.authSdk, def);
    }

    public forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
        throw new NotImplemented("execution by uri reference not yet implemented");
    }
}
