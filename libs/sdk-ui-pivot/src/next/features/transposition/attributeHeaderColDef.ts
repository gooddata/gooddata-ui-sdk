// (C) 2025 GoodData Corporation

import { IntlShape } from "react-intl";

import { DataViewFacade, ExplicitDrill, ITableValueColumnDefinition } from "@gooddata/sdk-ui";

import { AgGridCellRendererParams, AgGridColumnDef } from "../../types/agGrid.js";
import {
    extractFormattedValue,
    getAttributeHeaderName,
    transposedMetricCellRenderer,
} from "../columns/shared.js";
import { getCellClassName } from "../styling/cell.js";
import { getHeaderCellClassName } from "../styling/headerCell.js";

/**
 * Creates attribute header col def (for transposed table).
 *
 * @internal
 */
export function createAttributeHeaderColDef(
    colId: string,
    columnDefinition: ITableValueColumnDefinition & ({ isTransposed: true } | { isEmpty: true }),
    intl: IntlShape,
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
): AgGridColumnDef {
    const { attributeHeader } = columnDefinition;
    const tableHasMeasures = dv ? dv.definition.measures.length > 0 : true;
    return {
        colId,
        field: `cellDataByColId.${colId}.formattedValue`,
        context: {
            columnDefinition,
        },
        headerName: getAttributeHeaderName(attributeHeader, intl),
        valueGetter: (params) => {
            return extractFormattedValue(params, colId);
        },
        cellClass: (params) => {
            return getCellClassName(params, drillableItems, dv);
        },
        cellRenderer: (params: AgGridCellRendererParams) => {
            return transposedMetricCellRenderer(params, tableHasMeasures);
        },
        headerClass: getHeaderCellClassName,
        headerComponent: "AttributeHeader",
        sortable: false,
    };
}
