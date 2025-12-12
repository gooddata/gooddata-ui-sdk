// (C) 2025 GoodData Corporation

import { type IAttribute, type ITotal, bucketSetTotals } from "@gooddata/sdk-model";

import { orderTotals } from "./ordering.js";
import { addTotalsToDimension } from "../data/executionDefinition/dimensions.js";
import { type IPivotTableExecutionDefinition } from "../data/executionDefinition/types.js";

/**
 * Applies totals to execution definition.
 *
 * @internal
 */
export const applyTotalsToExecutionDef =
    ({ rows, columns, totals }: { rows: IAttribute[]; columns: IAttribute[]; totals: ITotal[] }) =>
    (executionDefinition: IPivotTableExecutionDefinition): IPivotTableExecutionDefinition => {
        if (totals.length === 0) {
            return executionDefinition;
        }

        const [measuresBucket, rowsBucket, columnsBucket] = executionDefinition.buckets;
        const [rowsDimension, columnsDimension] = executionDefinition.dimensions;

        const rowTotals = orderTotals(
            totals.filter((total) =>
                rows.find((attr) => attr.attribute.localIdentifier === total.attributeIdentifier),
            ),
        );

        const columnTotals = orderTotals(
            totals.filter((total) =>
                columns.find((attr) => attr.attribute.localIdentifier === total.attributeIdentifier),
            ),
        );

        return {
            ...executionDefinition,
            dimensions: [
                addTotalsToDimension(rowTotals, rowsDimension),
                addTotalsToDimension(columnTotals, columnsDimension),
            ],
            buckets: [
                measuresBucket,
                bucketSetTotals(rowsBucket, rowTotals),
                bucketSetTotals(columnsBucket, columnTotals),
            ],
        };
    };
