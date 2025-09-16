// (C) 2025 GoodData Corporation

import { useState } from "react";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import { useHeaderMenu } from "./hooks/useHeaderMenu.js";
import { useHeaderSorting } from "./hooks/useHeaderSorting.js";
import {
    getColumnMeasureIdentifier,
    getColumnScope,
    getPivotAttributeDescriptors,
    isValueColumnDef,
} from "./utils/common.js";
import { e } from "../../features/styling/bem.js";
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

    const { currentSort, handleHeaderClick } = useHeaderSorting(params);
    const { aggregationsItems, textWrappingItems, handleAggregationsItemClick, handleTextWrappingItemClick } =
        useHeaderMenu(
            allowAggregations,
            allowTextWrapping,
            measureIdentifier ? [measureIdentifier] : [],
            pivotAttributeDescriptors,
            params.api,
        );

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
