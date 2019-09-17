// (C) 2019 GoodData Corporation

import {
    defWithFilters,
    IExecutionFactory,
    IPreparedExecution,
    newDefFromBuckets,
    newDefFromInsight,
    newDefFromItems,
    NotImplemented,
} from "@gooddata/sdk-backend-spi";
import { AttributeOrMeasure, IBucket, IFilter, IInsight } from "@gooddata/sdk-model";
import { AxiosInstance } from "axios";
import { TigerPreparedExecution } from "./preparedExecution";

export class TigerExecution implements IExecutionFactory {
    constructor(private readonly axios: AxiosInstance, private readonly workspace: string) {}

    public forBuckets(buckets: IBucket[], filters?: IFilter[]): IPreparedExecution {
        const def = defWithFilters(newDefFromBuckets(this.workspace, buckets), filters);

        return new TigerPreparedExecution(this.axios, def);
    }

    public forInsight(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
        const def = defWithFilters(newDefFromInsight(this.workspace, insight), filters);

        return new TigerPreparedExecution(this.axios, def);
    }

    public forItems(items: AttributeOrMeasure[], filters?: IFilter[]): IPreparedExecution {
        const def = defWithFilters(newDefFromItems(this.workspace, items), filters);

        return new TigerPreparedExecution(this.axios, def);
    }

    public forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
        throw new NotImplemented("execution by uri reference not yet implemented");
    }
}
