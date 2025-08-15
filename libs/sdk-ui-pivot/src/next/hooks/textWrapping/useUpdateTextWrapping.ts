// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { ITextWrapping } from "../../types/textWrapping.js";
import { AgGridApi, AgGridColumnDef } from "../../types/agGrid.js";
import { useUpdateAgGridColumnDefs } from "../columns/useUpdateAgGridColumnDefs.js";
import { useGetAgGridColumns } from "../columns/useGetAgGridColumns.js";
import { useUpdateDefaultTextWrapping } from "./useUpdateDefaultTextWrapping.js";

/**
 * Manages text wrapping updates and communicates changes externally.
 * Updates ag-grid and keeps defaultColDef in sync; optionally communicates via pushData.
 *
 * Why both colDefs and defaultColDef must be updated (unlike column widths):
 * - ColumnDefs: wrapping for body cells is a per-column concern (`colDef.wrapText`). Changing just
 *   `defaultColDef` does not affect existing columns, so cells would not react without updating current
 *   column defs.
 * - DefaultColDef: header wrapping/auto height behavior depends on default column settings that the
 *   grid reads during header layout. Only updating column defs may not propagate to header rows and
 *   any lazily created defs. Keeping `defaultColDef` in sync ensures header behavior and future defs
 *   are consistent.
 * - Column widths differ: width is managed by the grid's sizing system and column state; a single
 *   update path is sufficient. Wrapping is a boolean style flag applied in multiple places, hence
 *   the need for both updates here.
 *
 * @internal
 */
export function useUpdateTextWrapping() {
    const { pushData } = usePivotTableProps();
    const updateAgGridColumnDefs = useUpdateAgGridColumnDefs();
    const updateDefaultTextWrapping = useUpdateDefaultTextWrapping();
    const getAgGridColumns = useGetAgGridColumns();

    const onUpdateTextWrapping = useCallback(
        (newTextWrapping: ITextWrapping, gridApi?: AgGridApi) => {
            if (gridApi) {
                const wrapText = !!newTextWrapping.wrapText;
                const wrapHeaderText = !!newTextWrapping.wrapHeaderText;

                // Update existing column defs so body cells respect the new wrapping settings immediately
                const allColumns = getAgGridColumns(gridApi);
                const updatedColDefs = allColumns?.map((column) => {
                    const colDef = column.getColDef();

                    return {
                        ...colDef,
                        wrapText,
                        wrapHeaderText,
                    };
                });

                if (updatedColDefs && updatedColDefs.length > 0) {
                    updateAgGridColumnDefs(updatedColDefs as AgGridColumnDef[], gridApi);
                }

                // Keep defaultColDef in sync so header layout and any future defs are consistent
                updateDefaultTextWrapping(gridApi, newTextWrapping);
            }

            if (pushData) {
                pushData({
                    properties: {
                        controls: {
                            textWrapping: newTextWrapping,
                        },
                    },
                });
            }
        },
        [pushData, updateAgGridColumnDefs, getAgGridColumns, updateDefaultTextWrapping],
    );

    return {
        onUpdateTextWrapping,
    };
}
