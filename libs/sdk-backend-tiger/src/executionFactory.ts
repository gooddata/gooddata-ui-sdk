// (C) 2019 GoodData Corporation

import { AbstractExecutionFactory, IPreparedExecution, NotImplemented } from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition, IFilter } from "@gooddata/sdk-model";
import { AxiosInstance } from "axios";
import { TigerPreparedExecution } from "./preparedExecution";

export class TigerExecution extends AbstractExecutionFactory {
    constructor(private readonly axios: AxiosInstance, workspace: string) {
        super(workspace);
    }

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return new TigerPreparedExecution(this.axios, def, this);
    }

    public forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
        throw new NotImplemented("execution by uri reference not yet implemented");
    }
}
