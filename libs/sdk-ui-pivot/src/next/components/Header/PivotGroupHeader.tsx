// (C) 2025 GoodData Corporation

import React from "react";
import { AgGridColumnGroupDef, AgGridHeaderGroupParams } from "../../types/agGrid.js";
import {
    getColumnScope,
    getPivotAttributeDescriptors,
    isAggregableColumnDefinition,
} from "./utils/common.js";
import { useHeaderMenu } from "./hooks/useHeaderMenu.js";
import { HeaderCell } from "./HeaderCell/HeaderCell.js";
import { useIsTransposed } from "../../hooks/shared/useIsTransposed.js";

interface IHeaderGroupCellProps extends AgGridHeaderGroupParams {
    measureIdentifiers: string[];
    pivotGroupDepth?: number;
}

/**
 * Renderer for pivot group header.
 */
export function PivotGroupHeader(params: IHeaderGroupCellProps) {
    const isTransposed = useIsTransposed();
    const colGroupDef = params.columnGroup.getColGroupDef() as AgGridColumnGroupDef;

    const columnScope = getColumnScope(colGroupDef.context.columnDefinition);
    const pivotAttributeDescriptors = getPivotAttributeDescriptors(columnScope);

    const allowAggregations =
        params.pivotGroupDepth !== 0 && // Not description level of the pivoting group
        isAggregableColumnDefinition(colGroupDef.context.columnDefinition) &&
        !isTransposed;
    const allowTextWrapping = true;

    const { aggregationsItems, textWrappingItems, handleAggregationsItemClick, handleTextWrappingItemClick } =
        useHeaderMenu(
            allowAggregations,
            allowTextWrapping,
            params.measureIdentifiers,
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
        />
    );
}
