// (C) 2019-2020 GoodData Corporation

import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { TigerPreparedExecution } from "./preparedExecution.js";
import { AbstractExecutionFactory, AuthenticatedCallGuard } from "@gooddata/sdk-backend-base";
import { DateFormatter } from "../../../convertors/fromBackend/dateFormatting/types.js";

/*
 * Note: if you come here one day to implement the forInsightByRef because tiger supports execute-by-reference,
 * then you are in for a treat. Check out comments in `tigerFactory` in the root index.
 */
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
