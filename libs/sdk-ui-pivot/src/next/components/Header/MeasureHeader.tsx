// (C) 2025 GoodData Corporation

import React from "react";

import { HeaderCell } from "./HeaderCell/HeaderCell.js";
import { useHeaderMenu } from "./hooks/useHeaderMenu.js";
import {
    getColumnMeasureIdentifier,
    getColumnScope,
    getPivotAttributeDescriptors,
    isValueColumnDef,
} from "./utils/common.js";
import { useIsTransposed } from "../../hooks/shared/useIsTransposed.js";
import { AgGridColumnDef, AgGridHeaderParams } from "../../types/agGrid.js";

/**
 * Renderer for measure header.
 */
export function MeasureHeader(params: AgGridHeaderParams) {
    const isTransposed = useIsTransposed();
    const colDef = params.column.getColDef() as AgGridColumnDef;

    const columnDefinition = colDef.context.columnDefinition;
    const isValueColDef = isValueColumnDef(columnDefinition);
    const columnScope = getColumnScope(columnDefinition);
    const pivotAttributeDescriptors = getPivotAttributeDescriptors(columnScope);
    const measureIdentifier = getColumnMeasureIdentifier(columnScope);

    const allowAggregations = isValueColDef && !isTransposed;
    const allowTextWrapping = isValueColDef;

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
