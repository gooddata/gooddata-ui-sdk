// (C) 2007-2025 GoodData Corporation
import { CellClassParams } from "ag-grid-enterprise";
import { DataViewFacade, ExplicitDrill } from "@gooddata/sdk-ui";
import cx from "classnames";
import { AgGridRowData } from "../../types/internal.js";
import { isCellDrillable } from "../drilling/isDrillable.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { e } from "./bem.js";

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
    if (!colDef || !data) {
        return e("cell");
    }

    const colId = colDef.colId ?? colDef.field;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const colData = data.meta[colId] as ITableDataValue;
    const isAttribute = colData?.type === "attributeHeader";
    const isDrillable = isCellDrillable(colDef as AgGridColumnDef, data, drillableItems ?? [], dv);
    const isNull = !isAttribute && colData?.formattedValue === "";

    return cx(
        e("cell", {
            drillable: isDrillable,
            attribute: isAttribute,
            metric: !isAttribute,
            null: isNull,
        }),
    );
};
