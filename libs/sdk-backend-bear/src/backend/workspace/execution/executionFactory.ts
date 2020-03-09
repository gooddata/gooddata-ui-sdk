// (C) 2019 GoodData Corporation

import { AbstractExecutionFactory, IPreparedExecution, NotImplemented } from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition, IFilter } from "@gooddata/sdk-model";
import { BearAuthenticatedCallGuard } from "../../../types";
import { BearPreparedExecution } from "./preparedExecution";

export class BearExecution extends AbstractExecutionFactory {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, workspace: string) {
        super(workspace);
    }

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return new BearPreparedExecution(this.authCall, def, this);
    }

    public forInsightByRef(_uri: string, _filters?: IFilter[]): Promise<IPreparedExecution> {
        throw new NotImplemented("execution by uri reference not yet implemented");
    }
}
