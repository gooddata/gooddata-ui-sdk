// (C) 2025-2026 GoodData Corporation

import { useCallback } from "react";

import { useAutoSizeReset } from "./useAutoSizeReset.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { usePivotTableSizing } from "../../context/PivotTableSizingContext.js";
import { type AgGridColumnDef, type AgGridOnColumnResized, type AgGridProps } from "../../types/agGrid.js";
import { useGetAgGridColumns } from "../columns/useGetAgGridColumns.js";
import { useUpdateAgGridColumnDefs } from "../columns/useUpdateAgGridColumnDefs.js";

const autoSizeStrategy: AgGridProps["autoSizeStrategy"] = {
    type: "fitCellContents",
    skipHeader: false,
};

/**
 * Returns column sizing props for ag-grid when grid should fit full horizontal space (growToFit) and adapt size to cell content (autoresizeAll or viewport).
 * It keeps ratio of the cell/header content in responsive context.
 *
 * @internal
 */
export function useColumnSizingForFullHorizontalSpaceAndAutoResize() {
    const { config } = usePivotTableProps();
    const { columnSizing } = config;
    const { defaultWidth, growToFit } = columnSizing;
    const shouldAdaptSizeToCellContent = defaultWidth === "autoresizeAll" || defaultWidth === "viewport";
    const shouldFillFullHorizontalSpace = growToFit ?? false;
    const isColumnSizingForGrowToFitAndAutoResize =
        shouldAdaptSizeToCellContent && shouldFillFullHorizontalSpace;

    const { containerWidth } = usePivotTableSizing();
    const getAgGridColumns = useGetAgGridColumns();
    const updateAgGridColumnDefs = useUpdateAgGridColumnDefs();

    const { shouldSkipResize, markAsInitializedIfNeeded } = useAutoSizeReset();

    const initColumnWidths = useCallback<AgGridOnColumnResized>(
        (params) => {
            if (!["autosizeColumns", "sizeColumnsToFit"].includes(params.source)) {
                return;
            }

            const allColumns = getAgGridColumns(params.api);
            const allColumnsWidth =
                allColumns?.reduce((acc, column) => acc + column.getActualWidth(), 0) ?? 0;

            if (shouldSkipResize(allColumnsWidth, containerWidth)) {
                return;
            }

            const updatedColDefs = allColumns?.map((column) => {
                const colDef = column.getColDef();
                const width = column.getActualWidth();

                // Keep manually set size
                if (colDef.width) {
                    return colDef;
                }

                if (allColumnsWidth < containerWidth) {
                    //Fill the whole container width
                    return {
                        ...colDef,
                        flex: width,
                    };
                }

                //Keep content-sized width
                return {
                    ...colDef,
                    flex: undefined,
                };
            });

            if (updatedColDefs) {
                updateAgGridColumnDefs(updatedColDefs as AgGridColumnDef[], params.api);
            }

            markAsInitializedIfNeeded(allColumnsWidth, containerWidth);
        },
        [
            getAgGridColumns,
            updateAgGridColumnDefs,
            containerWidth,
            shouldSkipResize,
            markAsInitializedIfNeeded,
        ],
    );

    return isColumnSizingForGrowToFitAndAutoResize
        ? {
              autoSizeStrategy,
              initColumnWidths,
          }
        : null;
}
