// (C) 2025 GoodData Corporation
import { IAttribute, IFilter, IMeasure, ISortItem, ITotal } from "@gooddata/sdk-model";
import flow from "lodash/flow.js";
import { MeasureGroupDimension } from "../../types/transposition.js";
import { IPivotTableExecutionDefinition } from "./executionDefinition/types.js";
import { DEFAULT_PIVOT_TABLE_EXECUTION_DEFINITION } from "./executionDefinition/constants.js";
import { applyWorkspaceToExecutionDef } from "./executionDefinition/workspace.js";
import { applyAttributesToExecutionDef } from "./executionDefinition/attributes.js";
import { applyMeasuresToExecutionDef } from "./executionDefinition/measures.js";
import { applyFiltersToExecutionDef } from "./executionDefinition/filters.js";
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
}: IPivotTableExecutionDefinitionParams): IPivotTableExecutionDefinition {
    return flow(
        applyWorkspaceToExecutionDef({ workspace }),
        applyAttributesToExecutionDef({ rows, columns }),
        applyMeasuresToExecutionDef({ measures }),
        applyFiltersToExecutionDef({ filters }),
        applyTotalsToExecutionDef({ rows, columns, totals }),
        applySortByToExecutionDef({ sortBy }),
        applyTranspositionToExecutionDef({ measureGroupDimension }),
    )(DEFAULT_PIVOT_TABLE_EXECUTION_DEFINITION);
}
