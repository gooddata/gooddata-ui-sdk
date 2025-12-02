// (C) 2025 GoodData Corporation

import { IntlShape } from "react-intl";

import { assertNever } from "@gooddata/sdk-model";
import { DataViewFacade, ITableColumnDefinition, UnexpectedSdkError } from "@gooddata/sdk-ui";

import { createAttributeColDef } from "./attributeColDef.js";
import { columnDefinitionToColId } from "./colId.js";
import { createMeasureColDef } from "./measureColDef.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { ColumnHeadersPosition } from "../../types/transposition.js";
import { createAttributeHeaderColDef } from "../transposition/attributeHeaderColDef.js";
import { createMeasureGroupHeaderColDef } from "../transposition/measureGroupHeaderColDef.js";
import { createMeasureGroupValueColDef } from "../transposition/measureGroupValueColDef.js";
import { createTotalHeaderColDef } from "../transposition/totalHeaderColDef.js";

/**
 * Creates {@link AgGridColumnDef} for specified column definition {@link ITableColumnDefinition}.
 *
 * @internal
 */
export function createColDef(
    columnDefinition: ITableColumnDefinition,
    columnHeadersPosition: ColumnHeadersPosition,
    intl: IntlShape,
    dv?: DataViewFacade,
): AgGridColumnDef {
    const colId = columnDefinitionToColId(columnDefinition, columnHeadersPosition);

    switch (columnDefinition.type) {
        case "attribute":
            return createAttributeColDef(colId, columnDefinition, intl);
        case "value":
            if (columnDefinition.isTransposed || columnDefinition.isEmpty) {
                return createAttributeHeaderColDef(colId, columnDefinition, intl, dv);
            }

            return createMeasureColDef(colId, columnDefinition);

        case "subtotal":
        case "grandTotal": {
            if (columnDefinition.isTransposed) {
                return createTotalHeaderColDef(colId, columnDefinition, intl);
            }

            return createMeasureColDef(colId, columnDefinition);
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
