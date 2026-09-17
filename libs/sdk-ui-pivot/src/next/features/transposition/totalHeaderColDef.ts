// (C) 2025-2026 GoodData Corporation

import { type HeaderClassParams } from "ag-grid-enterprise";
import { type IntlShape } from "react-intl";

import { type ITableGrandTotalColumnDefinition, type ITableSubtotalColumnDefinition } from "@gooddata/sdk-ui";

import { MetricCell } from "../../components/Cell/MetricCell.js";
import { type AgGridColumnDef } from "../../types/agGrid.js";
import { type AgGridRowData } from "../../types/internal.js";
import { extractFormattedValue, extractIntlTotalHeaderValue } from "../columns/shared.js";
import { e } from "../styling/bem.js";
import { getMeasureCellStyle } from "../styling/cell.js";
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
            cellRendererFactory: (params, cellTypes) => MetricCell({ ...params, cellTypes }),
        },
        headerName: localizedHeaderName,
        valueGetter: (params) => {
            return extractFormattedValue(params, colId);
        },
        cellStyle: getMeasureCellStyle,
        // This header shows the total's own label (e.g. "Sum", or a custom rename) rather than a
        // numeric value, so it must not pick up the metric column's right-aligned styling - append a
        // modifier that overrides it back to left-aligned text.
        headerClass: (params: HeaderClassParams<AgGridRowData, string | null>) =>
            `${getHeaderCellClassName(params)} ${e("header-cell", { "total-label": true })}`,
        headerComponent: "MeasureHeader",
        sortable: false,
    };
}
