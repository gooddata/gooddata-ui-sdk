// (C) 2019 GoodData Corporation

import { IExecutionFactory, IPreparedExecution, NotImplemented } from "@gooddata/sdk-backend-spi";
import {
    AttributeOrMeasure,
    IBucket,
    IFilter,
    IInsight,
    IExecutionDefinition,
    newDefForItems,
    newDefForBuckets,
    newDefForInsight,
} from "@gooddata/sdk-model";
import { AxiosInstance } from "axios";
import { TigerPreparedExecution } from "./preparedExecution";

export class TigerExecution implements IExecutionFactory {
    constructor(private readonly axios: AxiosInstance, private readonly workspace: string) {}

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return new TigerPreparedExecution(this.axios, def);
    }

    public forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
        const def = newDefForItems(this.workspace, items, filters);

        return this.forDefinition(def);
    }

    public forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
        const def = newDefForBuckets(this.workspace, buckets, filters);

        return this.forDefinition(def);
    }

    public forInsight(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
        const def = newDefForInsight(this.workspace, insight, filters);

        return this.forDefinition(def);
    }

    public forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
        throw new NotImplemented("execution by uri reference not yet implemented");
    }
}
