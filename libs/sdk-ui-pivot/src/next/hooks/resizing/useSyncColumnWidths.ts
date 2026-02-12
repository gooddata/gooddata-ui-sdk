// (C) 2025-2026 GoodData Corporation

import { useCallback, useEffect, useRef } from "react";

import { isEqual } from "lodash-es";

import { usePrevious } from "@gooddata/sdk-ui";

import { useAgGridApi } from "../../context/AgGridApiContext.js";
import { useColumnDefs } from "../../context/ColumnDefsContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { createColumnWidthItemForColumnDefinition } from "../../features/resizing/createColumnWidthItemForColumnDefinition.js";
import { getColumnWidthItemValue } from "../../features/resizing/getColumnWidthItemValue.js";
import { isColumnWidthItemMatch } from "../../features/resizing/isColumnWidthItemMatch.js";
import { type AgGridColumnDef, type AgGridOnColumnResized } from "../../types/agGrid.js";
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
    const initialFlexByColId = useRef<Record<string, number | undefined>>({});

    const { agGridApi } = useAgGridApi();

    // Ag-grid autoSizeStrategy is triggered only on initial render and cannot be triggered again,
    // so store initial set column widths and flex, as we want to set them back later,
    // if they are no longer coming from the props.
    // (e.g. undo in AD to initial state to insight without stored columnWidths)
    const initSyncColumnWidths = useCallback<AgGridOnColumnResized>(
        (params) => {
            if (params.source !== "autosizeColumns") {
                return;
            }

            const allColumns = getAgGridColumns(params.api);
            allColumns?.forEach((column) => {
                const colDef = column.getColDef();
                const colId = colDef.colId!;
                initialWidthByColId.current[colId] = column.getActualWidth();
                initialFlexByColId.current[colId] = colDef.flex ?? undefined;
            });
        },
        [getAgGridColumns],
    );

    useEffect(() => {
        if (agGridApi && !isEqual(columnWidths, prevColumnWidths)) {
            const allColumns = getAgGridColumns(agGridApi);
            const updatedColDefs = allColumns?.map((column) => {
                const colDef = column.getColDef();
                const colId = colDef.colId!;
                const initialWidth = initialWidthByColId.current[colId];
                const initialFlex = initialFlexByColId.current[colId];
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

                // Column has a persisted explicit width — apply it and clear flex.
                if (existingWidthItem && currentColumnWidth !== undefined) {
                    return {
                        ...colDef,
                        flex: undefined,
                        width: currentColumnWidth,
                    };
                }

                // No persisted width (or persisted "auto") — restore to initial state.
                // Preserve the flex layout from the growToFit strategy if it was present initially,
                // so that non-resized columns keep their proportional sizing.
                if (initialFlex !== undefined) {
                    return {
                        ...colDef,
                        flex: initialFlex,
                        width: initialWidth,
                    };
                }

                // No flex was present initially — restore the initial fixed width.
                return {
                    ...colDef,
                    flex: undefined,
                    width: initialWidth,
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
