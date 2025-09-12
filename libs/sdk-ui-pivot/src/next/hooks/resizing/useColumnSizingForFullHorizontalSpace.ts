// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { AgGridColumnDef, AgGridOnColumnResized, AgGridProps } from "../../types/agGrid.js";
import { useGetAgGridColumns } from "../columns/useGetAgGridColumns.js";
import { useUpdateAgGridColumnDefs } from "../columns/useUpdateAgGridColumnDefs.js";

const autoSizeStrategy: AgGridProps["autoSizeStrategy"] = {
    type: "fitGridWidth",
};

/**
 * Returns column sizing props for ag-grid when grid should fit full horizontal space (growToFit).
 *
 * @internal
 */
export function useColumnSizingForFullHorizontalSpace() {
    const { config } = usePivotTableProps();
    const { columnSizing } = config;
    const { defaultWidth, growToFit } = columnSizing;
    const shouldAdaptSizeToCellContent = defaultWidth === "autoresizeAll" || defaultWidth === "viewport";
    const shouldFillFullHorizontalSpace = growToFit ?? false;
    const isColumnSizingForFullHorizontalSpace =
        shouldFillFullHorizontalSpace && !shouldAdaptSizeToCellContent;

    const getAgGridColumns = useGetAgGridColumns();
    const updateAgGridColumnDefs = useUpdateAgGridColumnDefs();

    const initColumnWidths = useCallback<AgGridOnColumnResized>(
        (params) => {
            if (params.source !== "autosizeColumns") {
                return;
            }

            const allColumns = getAgGridColumns(params.api);
            const updatedColDefs = allColumns?.map((column) => {
                const colDef = column.getColDef();
                const width = column.getActualWidth();

                // Keep manually set size
                if (colDef.width) {
                    return colDef;
                }

                // Adapt size to fill full horizontal space
                return {
                    ...colDef,
                    flex: width,
                };
            });

            if (updatedColDefs) {
                updateAgGridColumnDefs(updatedColDefs as AgGridColumnDef[], params.api);
            }
        },
        [getAgGridColumns, updateAgGridColumnDefs],
    );

    return isColumnSizingForFullHorizontalSpace
        ? {
              autoSizeStrategy,
              initColumnWidths,
          }
        : null;
}
