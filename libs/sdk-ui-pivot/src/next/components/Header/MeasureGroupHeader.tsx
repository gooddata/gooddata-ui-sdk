// (C) 2025 GoodData Corporation

import { useState } from "react";

import isEmpty from "lodash/isEmpty.js";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import { useHeaderMenu } from "./hooks/useHeaderMenu.js";
import {
    getColumnMeasureIdentifier,
    getPivotAttributeDescriptorsForMeasureGroup,
    getRowScope,
    isValueRowDef,
} from "./utils/common.js";
import { e } from "../../features/styling/bem.js";
import { AgGridCellRendererParams, AgGridColumnDef, AgGridHeaderParams } from "../../types/agGrid.js";

/**
 * Renderer for measure group header.
 *
 * This is a special case when measures are in row (transposition).
 *
 * Covers both header cell and value cell as whole column describes headers due to transposition.
 */
export function MeasureGroupHeader(params: AgGridCellRendererParams | AgGridHeaderParams) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isHeader = isHeaderParams(params);
    const colDef = (isHeader ? params.column.getColDef() : params.colDef) as AgGridColumnDef;
    const cellData = isHeader ? undefined : params.data?.cellDataByColId[colDef.colId!];

    const columnDefinition = cellData?.columnDefinition ?? colDef.context?.columnDefinition;
    const rowDefinition = cellData?.rowDefinition;

    const pivotAttributeDescriptors = getPivotAttributeDescriptorsForMeasureGroup(columnDefinition);
    const rowScope = getRowScope(rowDefinition);
    const measureIdentifier = getColumnMeasureIdentifier(rowScope);

    const allowAggregations = isValueRowDef(rowDefinition);
    const allowTextWrapping = isHeader; // we disable text wrapping for value cells

    const { aggregationsItems, textWrappingItems, handleAggregationsItemClick, handleTextWrappingItemClick } =
        useHeaderMenu(
            allowAggregations,
            allowTextWrapping,
            measureIdentifier ? [measureIdentifier] : [],
            pivotAttributeDescriptors,
            params.api,
        );

    const hasMenuItems = aggregationsItems.length > 0 || textWrappingItems.length > 0;

    const displayName = isHeader ? params.displayName : params.value;

    return (
        <div
            className={e("header-cell", {
                "is-menu-open": isMenuOpen,
            })}
        >
            <div className="gd-header-content">
                <span className="gd-header-text">{displayName}</span>
            </div>
            {hasMenuItems ? (
                <HeaderMenu
                    aggregationsItems={aggregationsItems}
                    textWrappingItems={textWrappingItems}
                    onAggregationsItemClick={handleAggregationsItemClick}
                    onTextWrappingItemClick={handleTextWrappingItemClick}
                    isMenuOpened={isMenuOpen}
                    onMenuOpenedChange={setIsMenuOpen}
                />
            ) : null}
        </div>
    );
}

function isHeaderParams(p: unknown): p is AgGridHeaderParams {
    return !isEmpty(p) && (p as AgGridHeaderParams).displayName !== undefined;
}
