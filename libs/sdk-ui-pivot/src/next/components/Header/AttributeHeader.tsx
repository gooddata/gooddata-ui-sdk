// (C) 2025 GoodData Corporation

import { useState } from "react";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import { useHeaderMenu } from "./hooks/useHeaderMenu.js";
import { useHeaderSorting } from "./hooks/useHeaderSorting.js";
import { e } from "../../features/styling/bem.js";
import { AgGridColumnDef, AgGridHeaderParams } from "../../types/agGrid.js";

/**
 * Renderer for attribute header.
 */
export function AttributeHeader(params: AgGridHeaderParams) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const allowAggregations = false;
    const allowTextWrapping = true;
    const colDef = params.column.getColDef() as AgGridColumnDef;

    const { currentSort, handleHeaderClick } = useHeaderSorting(params);
    const { aggregationsItems, textWrappingItems, handleAggregationsItemClick, handleTextWrappingItemClick } =
        useHeaderMenu(allowAggregations, allowTextWrapping, [], [], params.api);

    const hasMenuItems = aggregationsItems.length > 0 || textWrappingItems.length > 0;

    return (
        <div
            className={e("header-cell", {
                "is-menu-open": isMenuOpen,
            })}
        >
            <div className="gd-header-content">
                <span className="gd-header-text">{params.displayName}</span>
                {!!colDef.sortable && (
                    <span
                        className={`ag-icon ag-icon-${currentSort === "asc" ? "asc" : currentSort === "desc" ? "desc" : "none"}`}
                    ></span>
                )}
            </div>
            {!!colDef.sortable && (
                <div className="gd-header-cell-clickable-area" onClick={handleHeaderClick}></div>
            )}
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
