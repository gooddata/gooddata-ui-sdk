// (C) 2025 GoodData Corporation

import React from "react";
import { AgGridHeaderParams } from "../../types/agGrid.js";
import { HeaderCell } from "./HeaderCell/HeaderCell.js";
import { useHeaderMenu } from "./hooks/useHeaderMenu.js";

/**
 * Renderer for attribute header.
 */
export function AttributeHeader(params: AgGridHeaderParams) {
    const allowAggregations = false;
    const allowTextWrapping = true;

    const { aggregationsItems, textWrappingItems, handleAggregationsItemClick, handleTextWrappingItemClick } =
        useHeaderMenu(allowAggregations, allowTextWrapping, [], [], params.api);

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
