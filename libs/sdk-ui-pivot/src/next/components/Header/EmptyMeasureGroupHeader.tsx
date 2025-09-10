// (C) 2025 GoodData Corporation

import React, { useState } from "react";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import { useHeaderMenu } from "./hooks/useHeaderMenu.js";
import { e } from "../../features/styling/bem.js";
import { AgGridCellRendererParams } from "../../types/agGrid.js";

/**
 * Renderer for empty measure group header.
 *
 * This is a special case when measures are in row (transposition) and there is no measure group header value.
 */
export function EmptyMeasureGroupHeader(params: AgGridCellRendererParams) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const allowAggregations = false;
    const allowTextWrapping = true;

    const { aggregationsItems, textWrappingItems, handleAggregationsItemClick, handleTextWrappingItemClick } =
        useHeaderMenu(allowAggregations, allowTextWrapping, [], [], params.api);

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
                    onAggregationsItemClick={handleAggregationsItemClick}
                    onTextWrappingItemClick={handleTextWrappingItemClick}
                    isMenuOpened={isMenuOpen}
                    onMenuOpenedChange={setIsMenuOpen}
                />
            ) : null}
        </div>
    );
}
