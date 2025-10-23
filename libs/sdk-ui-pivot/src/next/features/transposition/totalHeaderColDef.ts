// (C) 2025 GoodData Corporation

import { ICellRendererParams } from "ag-grid-enterprise";
import { IntlShape } from "react-intl";

import {
    DataViewFacade,
    ExplicitDrill,
    ITableGrandTotalColumnDefinition,
    ITableSubtotalColumnDefinition,
} from "@gooddata/sdk-ui";

import { MetricCell } from "../../components/Cell/MetricCell.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { extractFormattedValue, extractIntlTotalHeaderValue } from "../columns/shared.js";
import { getCellClassName, getCellTypes, getMeasureCellStyle } from "../styling/cell.js";
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
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
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
        cellStyle: getMeasureCellStyle,
        cellRenderer: (params: ICellRendererParams) => {
            const cellTypes = getCellTypes(params, drillableItems, dv);
            return MetricCell({ ...params, cellTypes });
        },
        headerClass: getHeaderCellClassName,
        sortable: false,
    };
}
