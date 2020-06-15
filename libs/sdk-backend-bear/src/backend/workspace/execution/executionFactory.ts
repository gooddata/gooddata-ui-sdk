// (C) 2019-2020 GoodData Corporation

import { IPreparedExecution, NotImplemented } from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition, IFilter } from "@gooddata/sdk-model";
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { BearPreparedExecution } from "./preparedExecution";
import { AbstractExecutionFactory } from "@gooddata/sdk-backend-base";

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
