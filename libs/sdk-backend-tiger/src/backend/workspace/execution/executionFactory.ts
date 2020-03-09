// (C) 2019-2020 GoodData Corporation

import {
    AbstractExecutionFactory,
    IPreparedExecution,
    NotImplemented,
    AuthenticatedCallGuard,
} from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition, IFilter } from "@gooddata/sdk-model";
import { TigerPreparedExecution } from "./preparedExecution";

export class TigerExecution extends AbstractExecutionFactory {
    constructor(private readonly authCall: AuthenticatedCallGuard, workspace: string) {
        super(workspace);
    }

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return new TigerPreparedExecution(this.authCall, def, this);
    }

    public forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
        throw new NotImplemented("execution by uri reference not yet implemented");
    }
}
