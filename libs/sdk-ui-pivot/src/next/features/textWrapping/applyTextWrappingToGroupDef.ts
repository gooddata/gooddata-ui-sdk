// (C) 2025 GoodData Corporation

import { getPivotGroupTextWrappingItemForColumnDefinition } from "./getPivotGroupTextWrappingItemForColumnDefinition.js";
import { AgGridColumnGroupDef } from "../../types/agGrid.js";
import { ITextWrapping } from "../../types/textWrapping.js";

/**
 * Applies text wrapping to pivot group header definition.
 *
 * @remarks
 * This function applies text wrapping settings to pivot group headers.
 * It checks if there's a pivot group locator that matches the column definition
 * associated with this group header.
 *
 * @internal
 */
export function applyTextWrappingToGroupDef(
    groupDef: AgGridColumnGroupDef,
    textWrapping: ITextWrapping,
): AgGridColumnGroupDef {
    const { columnDefinition } = groupDef.context;

    if (!columnDefinition) {
        return groupDef;
    }

    // Check for pivot group override
    const pivotGroupOverride = getPivotGroupTextWrappingItemForColumnDefinition(
        columnDefinition,
        textWrapping.columnOverrides ?? [],
    );

    // Apply pivot group override or global default
    const wrapHeaderText = pivotGroupOverride?.wrapHeaderText ?? textWrapping.wrapHeaderText;

    return {
        ...groupDef,
        wrapHeaderText: !!wrapHeaderText,
        autoHeaderHeight: !!wrapHeaderText,
    };
}
