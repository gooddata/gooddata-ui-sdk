// (C) 2019-2020 GoodData Corporation

import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { TigerPreparedExecution } from "./preparedExecution";
import { AbstractExecutionFactory, AuthenticatedCallGuard } from "@gooddata/sdk-backend-base";
import { DateFormatter } from "../../../convertors/fromBackend/dateFormatting/types";

export class TigerExecution extends AbstractExecutionFactory {
    constructor(
        private readonly authCall: AuthenticatedCallGuard,
        workspace: string,
        private readonly dateFormatter: DateFormatter,
    ) {
        super(workspace);
    }

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return new TigerPreparedExecution(this.authCall, def, this, this.dateFormatter);
    }
}
