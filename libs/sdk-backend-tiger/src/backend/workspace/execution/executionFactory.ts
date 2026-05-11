// (C) 2019-2026 GoodData Corporation

import { AbstractExecutionFactory, type AuthenticatedCallGuard } from "@gooddata/sdk-backend-base";
import { type IPreparedExecution, type IPreparedExecutionOptions } from "@gooddata/sdk-backend-spi";
import { type IExecutionDefinition } from "@gooddata/sdk-model";

import { type DateFormatter } from "../../../convertors/fromBackend/dateFormatting/types.js";

import { TigerPreparedExecution } from "./preparedExecution.js";

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

    public forDefinition(def: IExecutionDefinition, options?: IPreparedExecutionOptions): IPreparedExecution {
        return new TigerPreparedExecution(this.authCall, def, this, this.dateFormatter, options);
    }
}
