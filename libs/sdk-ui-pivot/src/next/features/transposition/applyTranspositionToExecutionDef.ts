// (C) 2025 GoodData Corporation
import { MeasureGroupDimension } from "../../types/transposition.js";
import {
    addMeasureGroupToDimension,
    removeMeasureGroupFromDimension,
} from "../data/executionDefinition/dimensions.js";
import { IPivotTableExecutionDefinition } from "../data/executionDefinition/types.js";

/**
 * Applies transposition (when measures are rendered in rows) to execution definition.
 *
 * @internal
 */
export const applyTranspositionToExecutionDef =
    ({ measureGroupDimension }: { measureGroupDimension: MeasureGroupDimension }) =>
    (executionDefinition: IPivotTableExecutionDefinition): IPivotTableExecutionDefinition => {
        const {
            measures,
            dimensions: [rowsDimension, columnsDimension],
        } = executionDefinition;

        if (measures.length === 0 || measureGroupDimension === "columns") {
            return executionDefinition;
        }

        return {
            ...executionDefinition,
            dimensions: [
                addMeasureGroupToDimension(rowsDimension),
                removeMeasureGroupFromDimension(columnsDimension),
            ],
        };
    };
