// (C) 2025 GoodData Corporation
import { useCallback, useState } from "react";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { useGetAgGridColumns } from "../columns/useGetAgGridColumns.js";
import { useUpdateAgGridColumnDefs } from "../columns/useUpdateAgGridColumnDefs.js";
import { AgGridProps, AgGridOnColumnResized, AgGridColumnDef } from "../../types/agGrid.js";
import { useUpdateColumnWidth } from "./useUpdateColumnWidths.js";

/**
 * Returns column sizing props for ag-grid when grid should fit full horizontal space (growToFit) and adapt size to cell content (autoresizeAll or viewport).
 * It keeps ratio of the cell/header content in responsive context.
 *
 * @internal
 */
export function useColumnSizingForFullHorizontalSpaceAndAutoResize(): Pick<
    AgGridProps,
    "autoSizeStrategy" | "onColumnResized"
> | null {
    const { config } = usePivotTableProps();
    const { columnSizing } = config;
    const { defaultWidth, growToFit } = columnSizing;
    const shouldAdaptSizeToCellContent = defaultWidth === "autoresizeAll" || defaultWidth === "viewport";
    const shouldFillFullHorizontalSpace = growToFit ?? false;
    const isColumnSizingForGrowToFitAndAutoResize =
        shouldAdaptSizeToCellContent && shouldFillFullHorizontalSpace;

    const [autoSizeStrategy, setAutoSizeStrategy] = useState<AgGridProps["autoSizeStrategy"]>({
        type: "fitCellContents",
        skipHeader: false,
    });

    const getAgGridColumns = useGetAgGridColumns();
    const updateAgGridColumnDefs = useUpdateAgGridColumnDefs();
    const { onUpdateColumnWidth } = useUpdateColumnWidth();

    const onColumnResized = useCallback<AgGridOnColumnResized>(
        (params) => {
            onUpdateColumnWidth(params);

            if (!autoSizeStrategy) {
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

                // Adapt size to fill full horizontal space and keeping the ratio of the original size
                return {
                    ...colDef,
                    flex: width,
                };
            });

            if (updatedColDefs) {
                updateAgGridColumnDefs(updatedColDefs as AgGridColumnDef[], params.api);
            }

            setAutoSizeStrategy(undefined);
        },
        [
            autoSizeStrategy,
            setAutoSizeStrategy,
            getAgGridColumns,
            updateAgGridColumnDefs,
            onUpdateColumnWidth,
        ],
    );

    return isColumnSizingForGrowToFitAndAutoResize
        ? {
              autoSizeStrategy,
              onColumnResized,
          }
        : null;
}
