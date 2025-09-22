// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { useAgGridApi } from "../../context/AgGridApiContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { AgGridColumnDef, AgGridOnColumnResized, AgGridProps } from "../../types/agGrid.js";
import { useGetAgGridColumns } from "../columns/useGetAgGridColumns.js";
import { useUpdateAgGridColumnDefs } from "../columns/useUpdateAgGridColumnDefs.js";

const autoSizeStrategy: AgGridProps["autoSizeStrategy"] = {
    type: "fitCellContents",
    skipHeader: false,
};

/**
 * Returns column sizing props for ag-grid for auto resize.
 
 * @internal
 */
export function useColumnSizingForAutoResize() {
    const { config } = usePivotTableProps();
    const { columnSizing } = config;
    const { defaultWidth, growToFit } = columnSizing;
    const shouldAdaptSizeToCellContent = defaultWidth === "autoresizeAll" || defaultWidth === "viewport";
    const shouldFillFullHorizontalSpace = growToFit ?? false;
    const isColumnSizingForAutoResize = shouldAdaptSizeToCellContent && !shouldFillFullHorizontalSpace;

    const { autoSizeInitialized, setAutoSizeInitialized } = useAgGridApi();
    const getAgGridColumns = useGetAgGridColumns();
    const updateAgGridColumnDefs = useUpdateAgGridColumnDefs();

    const initColumnWidths = useCallback<AgGridOnColumnResized>(
        (params) => {
            if (params.source !== "autosizeColumns" || autoSizeInitialized) {
                return;
            }

            const allColumns = getAgGridColumns(params.api);
            const updatedColDefs = allColumns?.map((column) => {
                return column.getColDef();
            });

            if (updatedColDefs) {
                updateAgGridColumnDefs(updatedColDefs as AgGridColumnDef[], params.api);
            }

            // Mark autosize as initialized to prevent future runs
            setAutoSizeInitialized(true);
        },
        [getAgGridColumns, updateAgGridColumnDefs, autoSizeInitialized, setAutoSizeInitialized],
    );

    return isColumnSizingForAutoResize
        ? {
              autoSizeStrategy,
              initColumnWidths,
          }
        : null;
}
