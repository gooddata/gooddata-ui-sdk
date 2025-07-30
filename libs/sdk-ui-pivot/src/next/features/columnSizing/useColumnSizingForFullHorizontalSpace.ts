// (C) 2025 GoodData Corporation
import { useCallback, useState } from "react";
import { useUpdateAgGridColumnDefs } from "../columnDefs/useUpdateAgGridColumnDefs.js";
import { useGetAgGridColumns } from "../columnDefs/useGetAgGridColumns.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { AgGridProps, AgGridOnColumnResized, AgGridColumnDef } from "../../types/agGrid.js";

/**
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

    const onColumnResized = useCallback<AgGridOnColumnResized>(
        (params) => {
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
        [autoSizeStrategy, setAutoSizeStrategy, getAgGridColumns, updateAgGridColumnDefs],
    );

    return isColumnSizingForFullHorizontalSpace
        ? {
              autoSizeStrategy,
              onColumnResized,
          }
        : null;
}
