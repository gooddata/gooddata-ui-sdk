// (C) 2025 GoodData Corporation

import { MouseEvent, useCallback, useState } from "react";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import { useHeaderMenu } from "./hooks/useHeaderMenu.js";
import { useHeaderSorting } from "./hooks/useHeaderSorting.js";
import { e } from "../../features/styling/bem.js";
import { useHeaderDrilling } from "../../hooks/useHeaderDrilling.js";
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
    const { handleHeaderDrill, isDrillable } = useHeaderDrilling(params);
    const { aggregationsItems, textWrappingItems, handleAggregationsItemClick, handleTextWrappingItemClick } =
        useHeaderMenu(allowAggregations, allowTextWrapping, [], [], params.api);

    const hasMenuItems = aggregationsItems.length > 0 || textWrappingItems.length > 0;

    // Combined click handler for both sorting and drilling
    const handleCombinedHeaderClick = useCallback(
        (e: MouseEvent) => {
            // First handle sorting if available
            if (colDef.sortable) {
                handleHeaderClick(e);
            }

            // Then handle drilling if available
            if (isDrillable) {
                handleHeaderDrill(e);
            }
        },
        [colDef.sortable, handleHeaderClick, isDrillable, handleHeaderDrill],
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
                {!!colDef.sortable && (
                    <span
                        className={`ag-icon ag-icon-${currentSort === "asc" ? "asc" : currentSort === "desc" ? "desc" : "none"}`}
                    ></span>
                )}
            </div>
            {!!colDef.sortable || !!isDrillable ? (
                <div className="gd-header-cell-clickable-area" onClick={handleCombinedHeaderClick}></div>
            ) : null}
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
