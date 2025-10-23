// (C) 2025 GoodData Corporation

import { ICellRendererParams } from "ag-grid-enterprise";
import { IntlShape } from "react-intl";

import { DataViewFacade, ExplicitDrill, ITableValueColumnDefinition } from "@gooddata/sdk-ui";

import { TransposedMetricCell } from "../../components/Cell/TransposedMetricCell.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { extractFormattedValue, getAttributeHeaderName } from "../columns/shared.js";
import { getCellClassName, getCellTypes, getMeasureCellStyle } from "../styling/cell.js";
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
        cellStyle: getMeasureCellStyle,
        cellRenderer: (params: ICellRendererParams) => {
            const cellTypes = getCellTypes(params, drillableItems, dv);
            return TransposedMetricCell({ ...params, tableHasMeasures, cellTypes });
        },
        headerClass: getHeaderCellClassName,
        headerComponent: "AttributeHeader",
        sortable: false,
    };
}
