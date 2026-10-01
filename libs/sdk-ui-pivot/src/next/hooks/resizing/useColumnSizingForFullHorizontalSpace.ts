// (C) 2025-2026 GoodData Corporation

import { type RefObject, useCallback } from "react";

import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { usePivotTableSizing } from "../../context/PivotTableSizingContext.js";
import { type AgGridColumnDef, type AgGridOnColumnResized, type AgGridProps } from "../../types/agGrid.js";
import { type IGridSizingState } from "../../types/internal.js";
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
export function useColumnSizingForFullHorizontalSpace(gridSizingStateRef: RefObject<IGridSizingState>) {
    const { config } = usePivotTableProps();
    const { columnSizing } = config;
    const { defaultWidth, growToFit } = columnSizing;
    const shouldAdaptSizeToCellContent = defaultWidth === "autoresizeAll" || defaultWidth === "viewport";
    const shouldFillFullHorizontalSpace = growToFit ?? false;
    const isColumnSizingForFullHorizontalSpace =
        shouldFillFullHorizontalSpace && !shouldAdaptSizeToCellContent;

    const { containerWidth } = usePivotTableSizing();
    const getAgGridColumns = useGetAgGridColumns();
    const updateAgGridColumnDefs = useUpdateAgGridColumnDefs();

    const initColumnWidths = useCallback<AgGridOnColumnResized>(
        (params) => {
            if (!["autosizeColumns", "sizeColumnsToFit"].includes(params.source)) {
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

            if (containerWidth > 0) {
                gridSizingStateRef.current.isSized = true;
            }
        },
        [containerWidth, getAgGridColumns, gridSizingStateRef, updateAgGridColumnDefs],
    );

    return isColumnSizingForFullHorizontalSpace
        ? {
              autoSizeStrategy,
              initColumnWidths,
          }
        : null;
}
