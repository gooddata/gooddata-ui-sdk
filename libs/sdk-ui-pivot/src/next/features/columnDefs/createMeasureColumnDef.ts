// (C) 2025 GoodData Corporation
import { IMeasureDescriptor } from "@gooddata/sdk-model";
import { DataViewFacade, ExplicitDrill, ITableColumnDefinition } from "@gooddata/sdk-ui";
import { metricCellRenderer } from "./shared.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { getCellClassName } from "../styling/cell.js";
import { e } from "../styling/bem.js";

/**
 * @internal
 */
export function createMeasureColumnDef(
    colId: string,
    columnDefinition: ITableColumnDefinition,
    measureDescriptor: IMeasureDescriptor,
    drillableItems?: ExplicitDrill[],
    dv?: DataViewFacade,
): AgGridColumnDef {
    return {
        colId,
        field: colId,
        context: {
            columnDefinition,
        },
        headerClass: e("header-cell"),
        cellClass: (params) => {
            return getCellClassName(params, drillableItems, dv);
        },
        headerName: measureDescriptor.measureHeaderItem.name,
        valueGetter: (params) => {
            return params.data?.[colId];
        },
        cellRenderer: metricCellRenderer,
    };
}
