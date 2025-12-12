// (C) 2025 GoodData Corporation
import { allowCellWrappingByColumnDefinition } from "./allowCellWrappingByColumnDefinition.js";
import { getColumnTextWrappingItemForColumnDefinition } from "./getColumnTextWrappingItemForColumnDefinition.js";
import { getPivotGroupTextWrappingItemForColumnDefinition } from "./getPivotGroupTextWrappingItemForColumnDefinition.js";
import { type AgGridColumnDef } from "../../types/agGrid.js";
import { type ITextWrapping } from "../../types/textWrapping.js";

/**
 * Applies text wrapping to col def.
 *
 * @remarks
 * This function applies text wrapping settings to a column definition, respecting hierarchy:
 * 1. Per-column overrides (most specific) - apply to specific columns
 * 2. Pivot group overrides (medium specific) - apply to pivot group headers and cascade to leaf columns
 * 3. Global defaults (least specific) - apply to all columns
 *
 * The hierarchy allows pivot group wrapping to affect descendant leaf columns, but individual
 * leaf columns can still override this with their own settings.
 *
 * @internal
 */
export const applyTextWrappingToColDef =
    (textWrapping: ITextWrapping) =>
    (colDef: AgGridColumnDef): AgGridColumnDef => {
        const { columnDefinition } = colDef.context;

        if (!columnDefinition) {
            console.error("Column definition is missing in colDef context", { colDef });
            return colDef;
        }

        // Check for direct column override (highest priority)
        const directOverride = getColumnTextWrappingItemForColumnDefinition(
            columnDefinition,
            textWrapping.columnOverrides ?? [],
        );

        // Check for pivot group override (medium priority)
        const pivotGroupOverride = getPivotGroupTextWrappingItemForColumnDefinition(
            columnDefinition,
            textWrapping.columnOverrides ?? [],
        );

        // Apply hierarchy: direct override > pivot group override > global default
        const wrapText = directOverride?.wrapText ?? pivotGroupOverride?.wrapText ?? textWrapping.wrapText;

        const wrapHeaderText =
            directOverride?.wrapHeaderText ??
            pivotGroupOverride?.wrapHeaderText ??
            textWrapping.wrapHeaderText;

        // Skip wrapText for some columns (performance optimization)
        const allowCellWrapping = allowCellWrappingByColumnDefinition(columnDefinition);
        const shouldWrapText = !!wrapText && allowCellWrapping;

        return {
            ...colDef,
            wrapText: shouldWrapText,
            wrapHeaderText: !!wrapHeaderText,
            autoHeight: shouldWrapText,
            autoHeaderHeight: !!wrapHeaderText,
        };
    };
