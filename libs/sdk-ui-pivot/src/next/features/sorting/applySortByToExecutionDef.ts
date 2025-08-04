// (C) 2025 GoodData Corporation
import { ISortItem } from "@gooddata/sdk-model";
import { IPivotTableExecutionDefinition } from "../data/executionDefinition/types.js";

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
