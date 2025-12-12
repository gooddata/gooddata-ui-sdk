// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { useInitialProp } from "@gooddata/sdk-ui/internal";

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { agGridAutoSizeAllColumnsForEmptyData } from "../../features/resizing/agGridColumnSizingApi.js";
import { type AgGridApi } from "../../types/agGrid.js";
import { type AgGridRowData } from "../../types/internal.js";

/**
 * Hook that sizes columns to fit the column headers content, when there is no data.
 *
 * @internal
 */
export function useInitSizingForEmptyData(): {
    initSizingForEmptyData: (gridApi: AgGridApi, rowData: AgGridRowData[]) => void;
} {
    const props = usePivotTableProps();
    const { config } = props;
    const {
        columnSizing: { columnWidths: initialColumnWidths, defaultWidth, growToFit },
    } = config;

    const columnWidths = useInitialProp(initialColumnWidths);

    const initSizingForEmptyData = useCallback(
        (gridApi: AgGridApi, rowData: AgGridRowData[]) => {
            if (!rowData.length) {
                agGridAutoSizeAllColumnsForEmptyData(
                    { columnSizing: { columnWidths, defaultWidth, growToFit } },
                    gridApi,
                );
            }
        },
        [columnWidths, defaultWidth, growToFit],
    );

    return {
        initSizingForEmptyData,
    };
}
