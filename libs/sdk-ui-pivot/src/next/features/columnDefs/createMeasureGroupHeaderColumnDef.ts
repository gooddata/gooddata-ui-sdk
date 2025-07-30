// (C) 2025 GoodData Corporation
import { METRIC_GROUP_NAME_COL_DEF_ID } from "../../constants/internal.js";
import { metricCellRenderer } from "./shared.js";
import { AgGridColumnDef } from "../../types/agGrid.js";
import { ITableColumnDefinition } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export const createMeasureGroupHeaderColumnDef = (
    columnDefinition: ITableColumnDefinition,
): AgGridColumnDef => {
    return {
        field: METRIC_GROUP_NAME_COL_DEF_ID,
        headerName: "",
        suppressHeaderMenuButton: true,
        context: {
            columnDefinition,
        },
        sortable: false,
        valueGetter: (params) => {
            return params.data?.[METRIC_GROUP_NAME_COL_DEF_ID];
        },
        cellRenderer: metricCellRenderer,
    };
};
