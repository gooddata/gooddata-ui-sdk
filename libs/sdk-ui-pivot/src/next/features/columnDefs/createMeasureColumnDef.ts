// (C) 2025 GoodData Corporation
import { IMeasureDescriptor } from "@gooddata/sdk-model";
import { ITableColumnDefinition } from "@gooddata/sdk-ui";
import { metricCellRenderer } from "./shared.js";
import { AgGridColumnDef } from "../../types/agGrid.js";

/**
 * @internal
 */
export function createMeasureColumnDef(
    colId: string,
    columnDefinition: ITableColumnDefinition,
    measureDescriptor: IMeasureDescriptor,
): AgGridColumnDef {
    return {
        colId,
        field: colId,
        context: {
            columnDefinition,
        },
        headerName: measureDescriptor.measureHeaderItem.name,
        valueGetter: (params) => {
            return params.data?.[colId];
        },
        cellRenderer: metricCellRenderer,
    };
}
