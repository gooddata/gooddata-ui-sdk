// (C) 2007-2025 GoodData Corporation

import { CellClassParams } from "ag-grid-community";
import { DataViewFacade, ExplicitDrill } from "@gooddata/sdk-ui";
import cx from "classnames";
import { isCellDrillable } from "../drill/isDrillable.js";
import { AgGridRowData } from "../types/internal.js";

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
        return "gd-cell";
    }

    const colId = colDef.colId ?? colDef.field;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const colData = data.meta[colId] as ITableDataValue;
    const isAttribute = colData?.type === "attributeHeader";
    const isDrillable = isCellDrillable(colDef, data, drillableItems ?? [], dv);

    return cx(
        "gd-cell",
        { "gd-cell--drillable": isDrillable },
        { "gd-cell--attribute": isAttribute },
        { "gd-cell--metric": !isAttribute },
    );
};
