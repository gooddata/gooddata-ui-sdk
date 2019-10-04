// (C) 2019 GoodData Corporation

import {
    defForBuckets,
    defForInsight,
    defForItems,
    IExecutionFactory,
    IPreparedExecution,
    NotImplemented,
    IExecutionDefinition,
} from "@gooddata/sdk-backend-spi";
import { AttributeOrMeasure, IBucket, IFilter, IInsight } from "@gooddata/sdk-model";
import { AxiosInstance } from "axios";
import { TigerPreparedExecution } from "./preparedExecution";

export class TigerExecution implements IExecutionFactory {
    constructor(private readonly axios: AxiosInstance, private readonly workspace: string) {}

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return new TigerPreparedExecution(this.axios, def);
    }

    public forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
        const def = defForItems(this.workspace, items, filters);

        return new TigerPreparedExecution(this.axios, def);
    }

    public forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
        const def = defForBuckets(this.workspace, buckets, filters);

        return new TigerPreparedExecution(this.axios, def);
    }

    public forInsight(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
        const def = defForInsight(this.workspace, insight, filters);

        return new TigerPreparedExecution(this.axios, def);
    }

    public forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
        throw new NotImplemented("execution by uri reference not yet implemented");
    }
}
