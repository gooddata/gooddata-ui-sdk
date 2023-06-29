// (C) 2019-2020 GoodData Corporation

import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    defaultDimensionsGenerator,
    defWithDimensions,
    IExecutionDefinition,
    IFilter,
    IInsight,
    INullableFilter,
    newDefForInsight,
} from "@gooddata/sdk-model";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { BearPreparedExecution } from "./preparedExecution.js";
import { AbstractExecutionFactory } from "@gooddata/sdk-backend-base";
import { BearPreparedExecutionByRef } from "./preparedExecutionByRef.js";
import compact from "lodash/compact.js";

export class BearExecution extends AbstractExecutionFactory {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, workspace: string) {
        super(workspace);
    }

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return new BearPreparedExecution(this.authCall, def, this);
    }

    public forInsightByRef(insight: IInsight, filters?: INullableFilter[]): IPreparedExecution {
        const def = defWithDimensions(
            newDefForInsight(this.workspace, insight, filters),
            defaultDimensionsGenerator,
        );

        const nonNullFilters = compact(filters);
        /*
         * Need different factory to retain `insight` and `filters` during as the prepared execution is
         * cumulatively constructed
         */
        const byRefFactory = new BearExecutionByRef(this.authCall, this.workspace, insight, nonNullFilters);

        return new BearPreparedExecutionByRef(this.authCall, def, insight, nonNullFilters, byRefFactory);
    }
}

/**
 * Execution by reference is a different execution type, represented by different class using with different endpoint. Yet
 * it still has to stick to the cumulative and fluent API specified by IPreparedExecution. On top of that, the executions
 * need to be done in a way that they support 'decorability' - so that they can be transparenty wrapped by for instance
 * caching decorator.
 *
 * The transparent decorability in combination with the requirements for cumulative, immutable construction require
 * that each implementation of prepared execution receives an execution factory to create the new instance of
 * the prepared execution with updated definition.
 *
 * In order for this to work with the execution by reference (implemented by different class, requiring always
 * the entire insight which contains the necessary 'ref'), it is essential to use this other execution factory which
 * retains this essential detail during the cumulative operations.
 */
class BearExecutionByRef extends AbstractExecutionFactory {
    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        workspace: string,
        private readonly insight: IInsight,
        private readonly filters: IFilter[] = [],
    ) {
        super(workspace);
    }

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return new BearPreparedExecutionByRef(this.authCall, def, this.insight, this.filters, this);
    }

    public forInsightByRef(insight: IInsight, filters?: IFilter[]): IPreparedExecution {
        const def = defWithDimensions(
            newDefForInsight(this.workspace, insight, filters),
            defaultDimensionsGenerator,
        );

        return new BearPreparedExecutionByRef(this.authCall, def, insight, filters, this);
    }
}
