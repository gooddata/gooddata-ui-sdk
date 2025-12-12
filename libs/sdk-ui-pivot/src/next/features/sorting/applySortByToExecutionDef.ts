// (C) 2025 GoodData Corporation
import { type ISortItem } from "@gooddata/sdk-model";

import { type IPivotTableExecutionDefinition } from "../data/executionDefinition/types.js";

/**
 * Applies provided sort items to execution definition.
 *
 * @internal
 */
export const applySortByToExecutionDef =
    ({ sortBy }: { sortBy: ISortItem[] }) =>
    (executionDefinition: IPivotTableExecutionDefinition): IPivotTableExecutionDefinition => {
        return {
            ...executionDefinition,
            sortBy,
        };
    };
