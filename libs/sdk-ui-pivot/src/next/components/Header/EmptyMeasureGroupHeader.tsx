// (C) 2025 GoodData Corporation

import React from "react";

import { HeaderCell } from "./HeaderCell/HeaderCell.js";
import { useHeaderMenu } from "./hooks/useHeaderMenu.js";
import { AgGridCellRendererParams } from "../../types/agGrid.js";

/**
 * Renderer for empty measure group header.
 *
 * This is a special case when measures are in row (transposition) and there is no measure group header value.
 */
export function EmptyMeasureGroupHeader(params: AgGridCellRendererParams) {
    const allowAggregations = false;
    const allowTextWrapping = true;

    const { aggregationsItems, textWrappingItems, handleAggregationsItemClick, handleTextWrappingItemClick } =
        useHeaderMenu(allowAggregations, allowTextWrapping, [], [], params.api);

    return (
        <HeaderCell
            displayName=""
            aggregationsItems={aggregationsItems}
            textWrappingItems={textWrappingItems}
            onAggregationsItemClick={handleAggregationsItemClick}
            onTextWrappingItemClick={handleTextWrappingItemClick}
        />
    );
}
