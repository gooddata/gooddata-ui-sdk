// (C) 2025 GoodData Corporation

import { type IntlShape } from "react-intl";

import { type DataViewFacade, type ITableValueColumnDefinition } from "@gooddata/sdk-ui";

import { TransposedMetricCell } from "../../components/Cell/TransposedMetricCell.js";
import { type AgGridColumnDef } from "../../types/agGrid.js";
import { extractFormattedValue, getAttributeHeaderName } from "../columns/shared.js";
import { getMeasureCellStyle } from "../styling/cell.js";
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
    dv?: DataViewFacade,
): AgGridColumnDef {
    const { attributeHeader } = columnDefinition;
    const tableHasMeasures = dv ? dv.definition.measures.length > 0 : true;
    return {
        colId,
        field: `cellDataByColId.${colId}.formattedValue`,
        context: {
            columnDefinition,
            cellRendererFactory: (params, cellTypes) =>
                TransposedMetricCell({ ...params, tableHasMeasures, cellTypes }),
        },
        headerName: getAttributeHeaderName(attributeHeader, intl),
        valueGetter: (params) => {
            return extractFormattedValue(params, colId);
        },
        cellStyle: getMeasureCellStyle,
        headerClass: getHeaderCellClassName,
        headerComponent: "AttributeHeader",
        sortable: false,
    };
}
