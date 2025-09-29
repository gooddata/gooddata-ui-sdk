// (C) 2025 GoodData Corporation

import { useState } from "react";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import { SortIndicator } from "./SortIndicator.js";
import { e } from "../../features/styling/bem.js";
import { useHeaderMenu } from "../../hooks/header/useHeaderMenu.js";
import { AgGridColumnDef, AgGridHeaderParams } from "../../types/agGrid.js";

/**
 * Renderer for attribute header.
 */
export function AttributeHeader(params: AgGridHeaderParams) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const allowAggregations = false;
    const allowTextWrapping = true;
    const colDef = params.column.getColDef() as AgGridColumnDef;
    const allowSorting = !!colDef.sortable;
    const allowDrilling = true;

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
        isDrillable,
        handleHeaderClick,
    } = useHeaderMenu(
        { allowAggregations, allowTextWrapping, allowSorting, allowDrilling },
        { measureIdentifiers: [], pivotAttributeDescriptors: [] },
        params,
    );

    return (
        <div
            className={e("header-cell", {
                "is-menu-open": isMenuOpen,
                drillable: isDrillable,
            })}
        >
            <div className="gd-header-content">
                <span className="gd-header-text">{params.displayName}</span>
                {!!colDef.sortable && sortDirection ? (
                    <SortIndicator sortDirection={sortDirection} sortIndex={sortIndex} />
                ) : null}
            </div>
            {!!colDef.sortable || !!isDrillable ? (
                <div className="gd-header-cell-clickable-area" onClick={handleHeaderClick}></div>
            ) : null}
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
