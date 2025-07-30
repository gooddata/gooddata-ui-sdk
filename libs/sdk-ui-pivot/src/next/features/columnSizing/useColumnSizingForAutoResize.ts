// (C) 2025 GoodData Corporation
import { useCallback, useState } from "react";
import { AgGridReactProps } from "ag-grid-react";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { AgGridProps, AgGridOnColumnResized, AgGridColumnDef } from "../../types/agGrid.js";
import { useUpdateAgGridColumnDefs } from "../columnDefs/useUpdateAgGridColumnDefs.js";
import { useGetAgGridColumns } from "../columnDefs/useGetAgGridColumns.js";

/**
 * @internal
 */
export function useColumnSizingForAutoResize(): Pick<
    AgGridProps,
    "autoSizeStrategy" | "onColumnResized"
> | null {
    const { config } = usePivotTableProps();
    const { columnSizing } = config;
    const { defaultWidth, growToFit } = columnSizing;
    const shouldAdaptSizeToCellContent = defaultWidth === "autoresizeAll" || defaultWidth === "viewport";
    const shouldFillFullHorizontalSpace = growToFit ?? false;
    const isColumnSizingForAutoResize = shouldAdaptSizeToCellContent && !shouldFillFullHorizontalSpace;

    const [autoSizeStrategy, setAutoSizeStrategy] = useState<AgGridReactProps["autoSizeStrategy"]>({
        type: "fitCellContents",
        skipHeader: false,
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

                // Keep manually set size
                if (colDef.width) {
                    return colDef;
                }

                return colDef;
            });

            if (updatedColDefs) {
                updateAgGridColumnDefs(updatedColDefs as AgGridColumnDef[], params.api);
            }

            setAutoSizeStrategy(undefined);
        },
        [autoSizeStrategy, setAutoSizeStrategy, getAgGridColumns, updateAgGridColumnDefs],
    );

    return isColumnSizingForAutoResize
        ? {
              autoSizeStrategy,
              onColumnResized,
          }
        : null;
}
