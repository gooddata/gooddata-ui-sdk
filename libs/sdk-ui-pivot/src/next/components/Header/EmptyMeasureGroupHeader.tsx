// (C) 2025 GoodData Corporation

import { useState } from "react";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import { e } from "../../features/styling/bem.js";
import { useHeaderCellAriaLabel } from "../../hooks/header/useHeaderCellAriaLabel.js";
import { useHeaderMenu } from "../../hooks/header/useHeaderMenu.js";
import { type AgGridHeaderParams } from "../../types/agGrid.js";

/**
 * Renderer for empty measure group header.
 *
 * This is a special case when measures are in row (transposition) and there is no measure group header value.
 */
export function EmptyMeasureGroupHeader(params: AgGridHeaderParams) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const allowAggregations = false;
    const allowTextWrapping = true;
    const allowSorting = false;
    const allowDrilling = false;
    const includeHeaderWrapping = false;
    const includeCellWrapping = true;

    const {
        aggregationsItems,
        textWrappingItems,
        sortingItems,
        handleAggregationsItemClick,
        handleTextWrappingItemClick,
        handleSortingItemClick,
        headerCellAriaLabel,
    } = useHeaderMenu(
        {
            allowAggregations,
            allowTextWrapping,
            allowSorting,
            allowDrilling,
            includeHeaderWrapping,
            includeCellWrapping,
        },
        { measureIdentifiers: [], pivotAttributeDescriptors: [] },
        params,
    );

    const hasMenuItems = aggregationsItems.length > 0 || textWrappingItems.length > 0;
    useHeaderCellAriaLabel(params.eGridHeader, headerCellAriaLabel);

    return (
        <div
            className={e("header-cell", {
                "is-menu-open": isMenuOpen,
            })}
        >
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
