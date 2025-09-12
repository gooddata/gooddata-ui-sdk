// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useRef } from "react";

import isEqual from "lodash/isEqual.js";

import { usePrevious } from "@gooddata/sdk-ui";

import { useAgGridApi } from "../../context/AgGridApiContext.js";
import { useColumnDefs } from "../../context/ColumnDefsContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { createColumnWidthItemForColumnDefinition } from "../../features/resizing/createColumnWidthItemForColumnDefinition.js";
import { getColumnWidthItemValue } from "../../features/resizing/getColumnWidthItemValue.js";
import { isColumnWidthItemMatch } from "../../features/resizing/isColumnWidthItemMatch.js";
import { AgGridColumnDef, AgGridOnColumnResized } from "../../types/agGrid.js";
import { useGetAgGridColumns } from "../columns/useGetAgGridColumns.js";
import { useUpdateAgGridColumnDefs } from "../columns/useUpdateAgGridColumnDefs.js";

/**
 * Sync columnWidths config coming from props to ag-grid state.
 *
 * @internal
 */
export function useSyncColumnWidths() {
    const { config, sortBy } = usePivotTableProps();
    const { columnSizing } = config;
    const { columnWidths } = columnSizing;
    const { columnDefsFlat } = useColumnDefs();

    const getAgGridColumns = useGetAgGridColumns();
    const updateAgGridColumnDefs = useUpdateAgGridColumnDefs();

    const prevColumnWidths = usePrevious(columnWidths);

    const initialWidthByColId = useRef<Record<string, number>>({});

    const { agGridApi } = useAgGridApi();

    // Ag-grid autoSizeStrategy is triggered only on initial render and cannot be triggered again,
    // so store initial set column widths, as we want to set them back later, if they are no longer coming from the props.
    // (e.g. undo in AD to initial state to insight without stored columnWidths)
    const initSyncColumnWidths = useCallback<AgGridOnColumnResized>(
        (params) => {
            if (params.source !== "autosizeColumns") {
                return;
            }

            const allColumns = getAgGridColumns(params.api);
            allColumns?.forEach((column) => {
                const colDef = column.getColDef();
                const initialWidth = column.getActualWidth();
                initialWidthByColId.current[colDef.colId!] = initialWidth;
            });
        },
        [getAgGridColumns],
    );

    useEffect(() => {
        if (agGridApi && !isEqual(columnWidths, prevColumnWidths)) {
            const allColumns = getAgGridColumns(agGridApi);
            const updatedColDefs = allColumns?.map((column) => {
                const colDef = column.getColDef();
                const initialWidth = initialWidthByColId.current[colDef.colId!];
                const widthItem = createColumnWidthItemForColumnDefinition(
                    colDef.context.columnDefinition,
                    initialWidth,
                );
                const existingWidthItem = columnWidths.find((existingWidthItem) =>
                    isColumnWidthItemMatch(widthItem, existingWidthItem),
                );
                const currentColumnWidth = existingWidthItem
                    ? getColumnWidthItemValue(existingWidthItem)
                    : undefined;

                // If no columnWidths are provided, use the initial width.
                if (!existingWidthItem) {
                    return {
                        ...colDef,
                        width: initialWidth,
                    };
                }

                // If columnWidths are provided, use the provided width.
                return {
                    ...colDef,
                    width: currentColumnWidth,
                };
            });

            if (updatedColDefs) {
                updateAgGridColumnDefs(updatedColDefs as AgGridColumnDef[], agGridApi);
            }
        }
    }, [
        columnWidths,
        prevColumnWidths,
        getAgGridColumns,
        updateAgGridColumnDefs,
        columnDefsFlat,
        sortBy,
        agGridApi,
    ]);

    return {
        initSyncColumnWidths,
    };
}
