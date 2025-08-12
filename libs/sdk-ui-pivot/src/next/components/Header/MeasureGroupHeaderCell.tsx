// (C) 2025 GoodData Corporation

import React from "react";
import { AgGridCellRendererParams, AgGridColumnDef } from "../../types/agGrid.js";
import { HeaderCellWithMenu } from "./HeaderCellWithMenu.js";
import {
    getColumnMeasureIdentifier,
    getPivotAttributeDescriptorsForMeasureGroup,
    getRowScope,
    isAggregableRowDefinition,
} from "./utils.js";
import { useHeaderMenu } from "./useHeaderMenu.js";

/**
 * Cell renderer for measure group header.
 *
 * This is a special case when measures are in row (transposition).
 */
export const MeasureGroupHeaderCell = (params: AgGridCellRendererParams) => {
    const colDef = params.colDef as AgGridColumnDef;
    const cellData = params.data?.cellDataByColId[colDef.colId!];
    const columnDefinition = cellData?.columnDefinition;
    const rowDefinition = cellData?.rowDefinition;

    const pivotAttributeDescriptors = getPivotAttributeDescriptorsForMeasureGroup(columnDefinition);
    const rowScope = getRowScope(rowDefinition);
    const measureIdentifier = getColumnMeasureIdentifier(rowScope);

    const { isMenuEnabled, handleItemClick, items } = useHeaderMenu(
        measureIdentifier ? [measureIdentifier] : [],
        pivotAttributeDescriptors,
    );

    if (!isMenuEnabled || !isAggregableRowDefinition(rowDefinition)) {
        return params.value;
    }

    return <HeaderCellWithMenu displayName={params.value} items={items} onItemClick={handleItemClick} />;
};
