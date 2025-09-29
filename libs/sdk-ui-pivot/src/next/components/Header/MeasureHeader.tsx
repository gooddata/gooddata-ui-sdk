// (C) 2025 GoodData Corporation

import { useState } from "react";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import { SortIndicator } from "./SortIndicator.js";
import {
    getColumnMeasureIdentifier,
    getColumnScope,
    getPivotAttributeDescriptors,
    isValueColumnDef,
} from "./utils/common.js";
import { e } from "../../features/styling/bem.js";
import { useHeaderMenu } from "../../hooks/header/useHeaderMenu.js";
import { useIsTransposed } from "../../hooks/shared/useIsTransposed.js";
import { AgGridColumnDef, AgGridHeaderParams } from "../../types/agGrid.js";

/**
 * Renderer for measure header.
 */
export function MeasureHeader(params: AgGridHeaderParams) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isTransposed = useIsTransposed();
    const colDef = params.column.getColDef() as AgGridColumnDef;
    const columnDefinition = colDef.context.columnDefinition;
    const isValueColDef = isValueColumnDef(columnDefinition);
    const columnScope = getColumnScope(columnDefinition);
    const pivotAttributeDescriptors = getPivotAttributeDescriptors(columnScope);
    const measureIdentifier = getColumnMeasureIdentifier(columnScope);

    const allowAggregations = isValueColDef && !isTransposed;
    const allowTextWrapping = isValueColDef;
    const allowSorting = !!colDef.sortable;
    const allowDrilling = false;

    const {
        aggregationsItems,
        textWrappingItems,
        sortingItems,
        sortDirection,
        sortIndex,
        hasMenuItems,
        handleAggregationsItemClick,
        handleTextWrappingItemClick,
        handleSortingItemClick,
        handleHeaderClick,
    } = useHeaderMenu(
        {
            allowAggregations,
            allowTextWrapping,
            allowSorting,
            allowDrilling,
        },
        { measureIdentifiers: measureIdentifier ? [measureIdentifier] : [], pivotAttributeDescriptors },
        params,
    );

    return (
        <div
            className={e("header-cell", {
                "is-menu-open": isMenuOpen,
            })}
        >
            <div className="gd-header-content">
                <span className="gd-header-text">{params.displayName}</span>
                {!!colDef.sortable && sortDirection ? (
                    <SortIndicator sortDirection={sortDirection} sortIndex={sortIndex} />
                ) : null}
            </div>
            {!!colDef.sortable && (
                <div className="gd-header-cell-clickable-area" onClick={handleHeaderClick}></div>
            )}
            {hasMenuItems ? (
                <HeaderMenu
                    aggregationsItems={aggregationsItems}
                    textWrappingItems={textWrappingItems}
                    sortingItems={sortingItems}
                    onAggregationsItemClick={handleAggregationsItemClick}
                    onTextWrappingItemClick={handleTextWrappingItemClick}
                    onSortingItemClick={handleSortingItemClick}
                    isMenuOpened={isMenuOpen}
                    onMenuOpenedChange={setIsMenuOpen}
                />
            ) : null}
        </div>
    );
}
