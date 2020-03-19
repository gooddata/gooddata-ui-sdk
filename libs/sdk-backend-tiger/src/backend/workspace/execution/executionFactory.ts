// (C) 2019-2020 GoodData Corporation

import { AbstractExecutionFactory, IPreparedExecution, NotImplemented } from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition, IFilter } from "@gooddata/sdk-model";
import { TigerPreparedExecution } from "./preparedExecution";
import { TigerAuthenticatedCallGuard } from "../../../types";

export class TigerExecution extends AbstractExecutionFactory {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, workspace: string) {
        super(workspace);
    }

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return new TigerPreparedExecution(this.authCall, def, this);
    }

    public forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
        throw new NotImplemented("execution by uri reference not yet implemented");
    }
}
