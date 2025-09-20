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

    const { containerWidth } = useAgGridApi();
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

                const allColumnsWidth = allColumns?.reduce((acc, column) => acc + column.getActualWidth(), 0);

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
                    width: width,
                    flex: undefined,
                };
            });

            if (updatedColDefs) {
                updateAgGridColumnDefs(updatedColDefs as AgGridColumnDef[], params.api);
            }
        },
        [getAgGridColumns, updateAgGridColumnDefs, containerWidth],
    );

    return isColumnSizingForGrowToFitAndAutoResize
        ? {
              autoSizeStrategy,
              initColumnWidths,
          }
        : null;
}
