// (C) 2025 GoodData Corporation
import { assertNever } from "@gooddata/sdk-model";
import { DataViewFacade, ExplicitDrill, ITableColumnDefinition, UnexpectedSdkError } from "@gooddata/sdk-ui";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { createMeasureColumnDef } from "./createMeasureColumnDef.js";
import { createAttributeColumnDef } from "./createAttributeColumnDef.js";
import { createAttributeTotalColumnDefWithTransposition } from "./createAttributeTotalColumnDefWithTransposition.js";
import { createAttributeColumnDefWithTransposition } from "./createAttributeColumnDefWithTransposition.js";
import { createMeasureGroupHeaderColumnDef } from "./createMeasureGroupHeaderColumnDef.js";
import { createMeasureGroupHeaderColumnDefWithTransposition } from "./createMeasureGroupHeaderColumnDefWithTransposition.js";
import { createMeasureGroupValueColumnDef } from "./createMeasureGroupValueColumnDef.js";
import { ColumnHeadersPosition } from "../../../publicTypes.js";
import { columnDefinitionToColId } from "./columnDefinitionToColId.js";

/**
 * @internal
 */
export function columnDefinitionToColDef(
    columnDefinition: ITableColumnDefinition,
    isTransposed: boolean,
    columnHeadersPosition: ColumnHeadersPosition,
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
): AgGridColumnDef {
    const colId = columnDefinitionToColId(columnDefinition, isTransposed, columnHeadersPosition);

    switch (columnDefinition.type) {
        case "attribute":
            return createAttributeColumnDef(colId, columnDefinition, drillableItems, dv);
        case "value":
        case "subtotal":
        case "grandTotal": {
            const reversedColumnScope = [...columnDefinition.columnScope].reverse();

            const measureScope = reversedColumnScope.find(
                (scope) => scope.type === "measureScope" || scope.type === "measureTotalScope",
            );

            const attributeTotalScope = reversedColumnScope.find(
                (scope) => scope.type === "attributeTotalScope",
            );

            const attributeScope = reversedColumnScope.find((scope) => scope.type === "attributeScope");

            if (measureScope) {
                const measureDescriptor = measureScope.descriptor;
                return createMeasureColumnDef(colId, columnDefinition, measureDescriptor, drillableItems, dv);
            } else if (attributeTotalScope) {
                return createAttributeTotalColumnDefWithTransposition(
                    colId,
                    columnDefinition,
                    attributeTotalScope.header,
                );
            } else if (attributeScope) {
                return createAttributeColumnDefWithTransposition(
                    colId,
                    columnDefinition,
                    attributeScope.header,
                );
            }

            throw new UnexpectedSdkError(
                `Cannot create col def for column definition: ${JSON.stringify(columnDefinition)}`,
            );
        }
        case "measureGroupHeader": {
            if (columnHeadersPosition === "left") {
                return createMeasureGroupHeaderColumnDefWithTransposition(colId, columnDefinition);
            }

            return createMeasureGroupHeaderColumnDef(columnDefinition);
        }
        case "measureGroupValue":
            return createMeasureGroupValueColumnDef(columnDefinition);
        default:
            assertNever(columnDefinition);
            throw new UnexpectedSdkError(
                `Cannot create col def for column definition: ${JSON.stringify(columnDefinition)}`,
            );
    }
}
