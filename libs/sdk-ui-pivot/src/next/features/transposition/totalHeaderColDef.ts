// (C) 2025 GoodData Corporation

import { IntlShape } from "react-intl";

import { ITableGrandTotalColumnDefinition, ITableSubtotalColumnDefinition } from "@gooddata/sdk-ui";

import { AgGridColumnDef } from "../../types/agGrid.js";
import { extractFormattedValue, extractIntlTotalHeaderValue, metricCellRenderer } from "../columns/shared.js";
import { getCellClassName, getMeasureCellStyle } from "../styling/cell.js";
import { getHeaderCellClassName } from "../styling/headerCell.js";

/**
 * Creates total header col def (for transposed table).
 *
 * @internal
 */
export function createTotalHeaderColDef(
    colId: string,
    columnDefinition: (ITableSubtotalColumnDefinition | ITableGrandTotalColumnDefinition) & {
        isTransposed: true;
    },
    intl: IntlShape,
): AgGridColumnDef {
    const { totalHeader } = columnDefinition;
    const localizedHeaderName = extractIntlTotalHeaderValue(totalHeader, intl);

    return {
        colId,
        field: `cellDataByColId.${colId}.formattedValue`,
        context: {
            columnDefinition,
        },
        headerName: localizedHeaderName,
        valueGetter: (params) => {
            return extractFormattedValue(params, colId);
        },
        cellClass: getCellClassName,
        cellStyle: (params) => {
            return getMeasureCellStyle(params);
        },
        cellRenderer: metricCellRenderer,
        headerClass: getHeaderCellClassName,
        sortable: false,
    };
}
