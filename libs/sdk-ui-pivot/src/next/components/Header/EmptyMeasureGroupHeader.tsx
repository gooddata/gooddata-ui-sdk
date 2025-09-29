// (C) 2025 GoodData Corporation

import { useState } from "react";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import { e } from "../../features/styling/bem.js";
import { useHeaderMenu } from "../../hooks/header/useHeaderMenu.js";

/**
 * Renderer for empty measure group header.
 *
 * This is a special case when measures are in row (transposition) and there is no measure group header value.
 */
export function EmptyMeasureGroupHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const allowAggregations = false;
    const allowTextWrapping = true;
    const allowSorting = false;
    const allowDrilling = false;

    const {
        aggregationsItems,
        textWrappingItems,
        sortingItems,
        handleAggregationsItemClick,
        handleTextWrappingItemClick,
        handleSortingItemClick,
    } = useHeaderMenu(
        {
            allowAggregations,
            allowTextWrapping,
            allowSorting,
            allowDrilling,
        },
        { measureIdentifiers: [], pivotAttributeDescriptors: [] },
        null,
    );

    const hasMenuItems = aggregationsItems.length > 0 || textWrappingItems.length > 0;

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
