// (C) 2025 GoodData Corporation

import React from "react";
import { HeaderCellWithMenu } from "./HeaderCellWithMenu.js";
import { AgGridColumnDef, AgGridHeaderParams } from "../../types/agGrid.js";
import { useHeaderMenu } from "./useHeaderMenu.js";
import {
    getColumnScope,
    getColumnMeasureIdentifier,
    getPivotAttributeDescriptors,
    isAggregableColumnDefinition,
} from "./utils.js";
import { useIsTransposed } from "../../hooks/shared/useIsTransposed.js";

/**
 * Cell renderer for measure header.
 */
export function MeasureHeaderCell(params: AgGridHeaderParams) {
    const isTransposed = useIsTransposed();
    const colDef = params.column.getColDef() as AgGridColumnDef;

    const columnScope = getColumnScope(colDef.context.columnDefinition);
    const pivotAttributeDescriptors = getPivotAttributeDescriptors(columnScope);
    const measureIdentifier = getColumnMeasureIdentifier(columnScope);

    const { isMenuEnabled, handleItemClick, items } = useHeaderMenu(
        measureIdentifier ? [measureIdentifier] : [],
        pivotAttributeDescriptors,
    );

    if (!isMenuEnabled || !isAggregableColumnDefinition(colDef.context.columnDefinition) || isTransposed) {
        return params.displayName;
    }

    return (
        <HeaderCellWithMenu displayName={params.displayName} items={items} onItemClick={handleItemClick} />
    );
}
