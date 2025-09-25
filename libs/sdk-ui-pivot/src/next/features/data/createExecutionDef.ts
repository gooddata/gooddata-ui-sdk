// (C) 2025 GoodData Corporation

import { IAttribute, IExecutionConfig, IFilter, IMeasure, ISortItem, ITotal } from "@gooddata/sdk-model";

import { applyAttributesToExecutionDef } from "./executionDefinition/attributes.js";
import { DEFAULT_PIVOT_TABLE_EXECUTION_DEFINITION } from "./executionDefinition/constants.js";
import { applyExecConfigToExecutionDef } from "./executionDefinition/execConfig.js";
import { applyFiltersToExecutionDef } from "./executionDefinition/filters.js";
import { applyMeasuresToExecutionDef } from "./executionDefinition/measures.js";
import { IPivotTableExecutionDefinition } from "./executionDefinition/types.js";
import { applyWorkspaceToExecutionDef } from "./executionDefinition/workspace.js";
import { MeasureGroupDimension } from "../../types/transposition.js";
import { applyTotalsToExecutionDef } from "../aggregations/applyTotalsToExecutionDef.js";
import { applySortByToExecutionDef } from "../sorting/applySortByToExecutionDef.js";
import { applyTranspositionToExecutionDef } from "../transposition/applyTranspositionToExecutionDef.js";

/**
 * @internal
 */
export interface IPivotTableExecutionDefinitionParams {
    workspace: string;
    columns: IAttribute[];
    rows: IAttribute[];
    measures: IMeasure[];
    filters: IFilter[];
    sortBy: ISortItem[];
    totals: ITotal[];
    measureGroupDimension: MeasureGroupDimension;
    execConfig: IExecutionConfig;
}

/**
 * Creates execution definition for pivot table, applying all its features.
 *
 * @internal
 */
export function createExecutionDef({
    workspace,
    columns,
    rows,
    measures,
    filters,
    sortBy,
    totals,
    measureGroupDimension,
    execConfig,
}: IPivotTableExecutionDefinitionParams): IPivotTableExecutionDefinition {
    return [
        applyWorkspaceToExecutionDef({ workspace }),
        applyAttributesToExecutionDef({ rows, columns }),
        applyMeasuresToExecutionDef({ measures }),
        applyFiltersToExecutionDef({ filters }),
        applyTotalsToExecutionDef({ rows, columns, totals }),
        applySortByToExecutionDef({ sortBy }),
        applyTranspositionToExecutionDef({ measureGroupDimension }),
        applyExecConfigToExecutionDef({ execConfig }),
    ].reduce((acc, fn) => fn(acc), DEFAULT_PIVOT_TABLE_EXECUTION_DEFINITION);
}
