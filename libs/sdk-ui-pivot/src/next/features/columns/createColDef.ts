// (C) 2025 GoodData Corporation
import { assertNever } from "@gooddata/sdk-model";
import { DataViewFacade, ExplicitDrill, ITableColumnDefinition, UnexpectedSdkError } from "@gooddata/sdk-ui";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { createMeasureColDef } from "./measureColDef.js";
import { createAttributeColDef } from "./attributeColDef.js";
import { createTotalHeaderColDef } from "../transposition/totalHeaderColDef.js";
import { createAttributeHeaderColDef } from "../transposition/attributeHeaderColDef.js";
import { createMeasureGroupHeaderColDef } from "../transposition/measureGroupHeaderColDef.js";
import { createMeasureGroupValueColDef } from "../transposition/measureGroupValueColDef.js";
import { ColumnHeadersPosition } from "../../types/transposition.js";
import { columnDefinitionToColId } from "./colId.js";

/**
 * Creates {@link AgGridColumnDef} for specified column definition {@link ITableColumnDefinition}.
 *
 * @internal
 */
export function createColDef(
    columnDefinition: ITableColumnDefinition,
    columnHeadersPosition: ColumnHeadersPosition,
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
): AgGridColumnDef {
    const colId = columnDefinitionToColId(columnDefinition, columnHeadersPosition);

    switch (columnDefinition.type) {
        case "attribute":
            return createAttributeColDef(colId, columnDefinition, drillableItems, dv);
        case "value":
            if (columnDefinition.isTransposed || columnDefinition.isEmpty) {
                return createAttributeHeaderColDef(colId, columnDefinition);
            }

            return createMeasureColDef(colId, columnDefinition, drillableItems, dv);

        case "subtotal":
        case "grandTotal": {
            if (columnDefinition.isTransposed) {
                return createTotalHeaderColDef(colId, columnDefinition);
            }

            return createMeasureColDef(colId, columnDefinition, drillableItems, dv);
        }
        case "measureGroupHeader": {
            return createMeasureGroupHeaderColDef(colId, columnDefinition, columnHeadersPosition);
        }
        case "measureGroupValue":
            return createMeasureGroupValueColDef(columnDefinition);
        default:
            assertNever(columnDefinition);
            throw new UnexpectedSdkError(
                `Cannot create col def for column definition: ${JSON.stringify(columnDefinition)}`,
            );
    }
}
