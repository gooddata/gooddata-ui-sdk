// (C) 2025 GoodData Corporation
import { type IFilter } from "@gooddata/sdk-model";

import { type IPivotTableExecutionDefinition } from "./types.js";

/**
 * Applies provided filters to the execution definition.
 
 * @internal
 */
export const applyFiltersToExecutionDef =
    ({ filters }: { filters: IFilter[] }) =>
    (executionDefinition: IPivotTableExecutionDefinition): IPivotTableExecutionDefinition => {
        if (filters.length === 0) {
            return executionDefinition;
        }

        return {
            ...executionDefinition,
            filters,
        };
    };
