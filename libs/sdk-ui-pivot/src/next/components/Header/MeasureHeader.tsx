// (C) 2025 GoodData Corporation

import React from "react";
import { HeaderCell } from "./HeaderCell/HeaderCell.js";
import { AgGridColumnDef, AgGridHeaderParams } from "../../types/agGrid.js";
import { useHeaderMenu } from "./hooks/useHeaderMenu.js";
import {
    getColumnScope,
    getColumnMeasureIdentifier,
    getPivotAttributeDescriptors,
    isAggregableColumnDefinition,
} from "./utils/common.js";
import { useIsTransposed } from "../../hooks/shared/useIsTransposed.js";

/**
 * Renderer for measure header.
 */
export function MeasureHeader(params: AgGridHeaderParams) {
    const isTransposed = useIsTransposed();
    const colDef = params.column.getColDef() as AgGridColumnDef;

    const columnScope = getColumnScope(colDef.context.columnDefinition);
    const pivotAttributeDescriptors = getPivotAttributeDescriptors(columnScope);
    const measureIdentifier = getColumnMeasureIdentifier(columnScope);

    const allowAggregations = isAggregableColumnDefinition(colDef.context.columnDefinition) && !isTransposed;
    const allowTextWrapping = true;

    const { aggregationsItems, textWrappingItems, handleAggregationsItemClick, handleTextWrappingItemClick } =
        useHeaderMenu(
            allowAggregations,
            allowTextWrapping,
            measureIdentifier ? [measureIdentifier] : [],
            pivotAttributeDescriptors,
            params.api,
        );

    return (
        <HeaderCell
            displayName={params.displayName}
            aggregationsItems={aggregationsItems}
            textWrappingItems={textWrappingItems}
            onAggregationsItemClick={handleAggregationsItemClick}
            onTextWrappingItemClick={handleTextWrappingItemClick}
            gridApi={params.api}
        />
    );
}
