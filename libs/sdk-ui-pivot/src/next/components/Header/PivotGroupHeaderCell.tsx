// (C) 2025 GoodData Corporation

import React from "react";
import { AgGridColumnGroupDef, AgGridHeaderGroupParams } from "../../types/agGrid.js";
import { getColumnScope, getPivotAttributeDescriptors, isAggregableColumnDefinition } from "./utils.js";
import { useHeaderMenu } from "./useHeaderMenu.js";
import { HeaderCellWithMenu } from "./HeaderCellWithMenu.js";
import { useIsTransposed } from "../../hooks/shared/useIsTransposed.js";

interface IHeaderGroupCellProps extends AgGridHeaderGroupParams {
    measureIdentifiers: string[];
    pivotGroupDepth?: number;
}

/**
 * Cell renderer for pivot group header.
 */
export function PivotGroupHeaderCell(params: IHeaderGroupCellProps) {
    const isTransposed = useIsTransposed();
    const colGroupDef = params.columnGroup.getColGroupDef() as AgGridColumnGroupDef;

    const columnScope = getColumnScope(colGroupDef.context.columnDefinition);
    const pivotAttributeDescriptors = getPivotAttributeDescriptors(columnScope);

    const { isMenuEnabled, handleItemClick, items } = useHeaderMenu(
        params.measureIdentifiers,
        pivotAttributeDescriptors,
    );

    if (
        !isMenuEnabled ||
        params.pivotGroupDepth === 0 || // Description level of the pivoting group
        !isAggregableColumnDefinition(colGroupDef.context.columnDefinition) ||
        isTransposed
    ) {
        return params.displayName;
    }

    return (
        <HeaderCellWithMenu displayName={params.displayName} items={items} onItemClick={handleItemClick} />
    );
}
