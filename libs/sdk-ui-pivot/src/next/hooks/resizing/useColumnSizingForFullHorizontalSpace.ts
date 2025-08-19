// (C) 2025 GoodData Corporation
import { useCallback, useState } from "react";

import { useUpdateColumnWidth } from "./useUpdateColumnWidths.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { AgGridColumnDef, AgGridOnColumnResized, AgGridProps } from "../../types/agGrid.js";
import { useGetAgGridColumns } from "../columns/useGetAgGridColumns.js";
import { useUpdateAgGridColumnDefs } from "../columns/useUpdateAgGridColumnDefs.js";

/**
 * Returns column sizing props for ag-grid when grid should fit full horizontal space (growToFit).
 *
 * @internal
 */
export function useColumnSizingForFullHorizontalSpace(): Pick<
    AgGridProps,
    "autoSizeStrategy" | "onColumnResized"
> | null {
    const { config } = usePivotTableProps();
    const { columnSizing } = config;
    const { defaultWidth, growToFit } = columnSizing;
    const shouldAdaptSizeToCellContent = defaultWidth === "autoresizeAll" || defaultWidth === "viewport";
    const shouldFillFullHorizontalSpace = growToFit ?? false;
    const isColumnSizingForFullHorizontalSpace =
        shouldFillFullHorizontalSpace && !shouldAdaptSizeToCellContent;

    const [autoSizeStrategy, setAutoSizeStrategy] = useState<AgGridProps["autoSizeStrategy"]>({
        type: "fitGridWidth",
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

                // Adapt size to fill full horizontal space
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

    return isColumnSizingForFullHorizontalSpace
        ? {
              autoSizeStrategy,
              onColumnResized,
          }
        : null;
}
