// (C) 2025 GoodData Corporation

import React from "react";
import { AgGridCellRendererParams, AgGridColumnDef } from "../../types/agGrid.js";
import { HeaderCell } from "./HeaderCell/HeaderCell.js";
import {
    getColumnMeasureIdentifier,
    getPivotAttributeDescriptorsForMeasureGroup,
    getRowScope,
    isAggregableRowDefinition,
} from "./utils/common.js";
import { useHeaderMenu } from "./hooks/useHeaderMenu.js";

/**
 * Renderer for measure group header.
 *
 * This is a special case when measures are in row (transposition).
 */
export const MeasureGroupHeader = (params: AgGridCellRendererParams) => {
    const colDef = params.colDef as AgGridColumnDef;
    const cellData = params.data?.cellDataByColId[colDef.colId!];
    const columnDefinition = cellData?.columnDefinition;
    const rowDefinition = cellData?.rowDefinition;

    const pivotAttributeDescriptors = getPivotAttributeDescriptorsForMeasureGroup(columnDefinition);
    const rowScope = getRowScope(rowDefinition);
    const measureIdentifier = getColumnMeasureIdentifier(rowScope);

    const allowAggregations = isAggregableRowDefinition(rowDefinition);
    const allowTextWrapping = false; // due to measures in rows

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
            displayName={params.value}
            aggregationsItems={aggregationsItems}
            textWrappingItems={textWrappingItems}
            onAggregationsItemClick={handleAggregationsItemClick}
            onTextWrappingItemClick={handleTextWrappingItemClick}
        />
    );
};
