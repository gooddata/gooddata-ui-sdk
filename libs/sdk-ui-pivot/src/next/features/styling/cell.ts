// (C) 2007-2025 GoodData Corporation
import { CellClassParams } from "ag-grid-enterprise";
import cx from "classnames";

import {
    DataViewFacade,
    ExplicitDrill,
    ITableDataValue,
    isTableAttributeHeaderValue,
    isTableGrandTotalHeaderValue,
    isTableGrandTotalMeasureValue,
    isTableGrandTotalSubtotalMeasureValue,
    isTableOverallTotalMeasureValue,
    isTableSubtotalMeasureValue,
    isTableTotalHeaderValue,
} from "@gooddata/sdk-ui";

import { CELL_CLASSNAME, e } from "./bem.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { AgGridRowData } from "../../types/internal.js";
import { isCellDrillable } from "../drilling/isDrillable.js";

/**
 * Returns a class name for a cell.
 *
 * @param params - The cell class params
 * @param drillableItems - The drillable items
 * @param dv - The data view facade
 * @returns A class name for the cell
 */
export const getCellClassName = (
    params: CellClassParams<AgGridRowData, string | null>,
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
): string => {
    const { colDef, data } = params;
    const colId = colDef?.colId ?? colDef?.field;

    if (!colDef || !data || !colId) {
        return CELL_CLASSNAME;
    }

    const colData = data.cellDataByColId?.[colId];

    if (!colData) {
        return CELL_CLASSNAME;
    }

    const isDrillable = isCellDrillable(colDef as AgGridColumnDef, data, drillableItems ?? [], dv);
    const isAttribute = isTableAttributeHeaderValue(colData);
    const isTotal = isTotalValue(colData);
    const isSubtotal = isTableSubtotalMeasureValue(colData);
    const isOverallTotal = isTableOverallTotalMeasureValue(colData);
    const isTotalHeader = isTotalHeaderValue(colData);
    const isNull = isNullValue(colData);

    return cx(
        e("cell", {
            drillable: isDrillable,
            attribute: isAttribute,
            metric: !isAttribute && !isTotalHeader,
            null: isNull,
            total: isTotal,
            subtotal: isSubtotal,
            "overall-total": isOverallTotal,
            "total-header": isTotalHeader,
        }),
    );
};

const isTotalHeaderValue = (colData: ITableDataValue) => {
    return isTableTotalHeaderValue(colData) || isTableGrandTotalHeaderValue(colData);
};

const isTotalValue = (colData: ITableDataValue) => {
    return isTableGrandTotalMeasureValue(colData) || isTableGrandTotalSubtotalMeasureValue(colData);
};

const isNullValue = (colData: ITableDataValue) => {
    return !isTableAttributeHeaderValue(colData) && colData.formattedValue === "";
};
