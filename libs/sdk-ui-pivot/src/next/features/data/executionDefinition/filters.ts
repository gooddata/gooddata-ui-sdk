// (C) 2025 GoodData Corporation
import { IFilter } from "@gooddata/sdk-model";

import { IPivotTableExecutionDefinition } from "./types.js";

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
