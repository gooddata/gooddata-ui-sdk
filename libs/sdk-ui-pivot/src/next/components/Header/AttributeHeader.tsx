// (C) 2025 GoodData Corporation

import { useState } from "react";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import { SortIndicator } from "./SortIndicator.js";
import { e } from "../../features/styling/bem.js";
import { useHeaderMenu } from "../../hooks/header/useHeaderMenu.js";
import { useHeaderMenuKeyboard } from "../../hooks/header/useHeaderMenuKeyboard.js";
import { useHeaderSpaceKey } from "../../hooks/header/useHeaderSpaceKey.js";
import {
    getPivotHeaderClickableAreaTestIdProps,
    getPivotHeaderTestIdProps,
    getPivotHeaderTextTestIdProps,
} from "../../testing/dataTestIdGenerators.js";
import { type AgGridColumnDef, type AgGridHeaderParams } from "../../types/agGrid.js";

/**
 * Renderer for attribute header.
 */
export function AttributeHeader(params: AgGridHeaderParams) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isKeyboardTriggered, setIsKeyboardTriggered] = useState(false);
    const colDef = params.column.getColDef() as AgGridColumnDef;
    const columnDefinition = colDef.context?.columnDefinition;

    // Checks if this is a transposed value column under a pivot group
    const isTransposedPivotedValue = columnDefinition?.type === "value" && columnDefinition?.isTransposed;

    const allowAggregations = false;
    const allowTextWrapping = !isTransposedPivotedValue; // No wrapping for transposed values in pivoting
    const includeHeaderWrapping = true;
    const includeCellWrapping = true;
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

    useHeaderSpaceKey(params, handleHeaderClick);
    useHeaderMenuKeyboard(
        params,
        () => {
            setIsKeyboardTriggered(true);
            setIsMenuOpen(true);
        },
        hasMenuItems,
    );

    return (
        <div
            className={e("header-cell", {
                "is-menu-open": isMenuOpen,
                drillable: isDrillable,
            })}
            {...getPivotHeaderTestIdProps({ drillable: isDrillable })}
        >
            <div className="gd-header-content">
                <span className="gd-header-text" {...getPivotHeaderTextTestIdProps()}>
                    {params.displayName}
                </span>
                {!!colDef.sortable && sortDirection ? (
                    <SortIndicator sortDirection={sortDirection} sortIndex={sortIndex} />
                ) : null}
            </div>
            {!!colDef.sortable || !!isDrillable ? (
                <div
                    className="gd-header-cell-clickable-area"
                    {...getPivotHeaderClickableAreaTestIdProps()}
                    onClick={handleHeaderClick}
                ></div>
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
                    onMenuOpenedChange={(opened) => {
                        setIsMenuOpen(opened);
                        if (!opened) {
                            setIsKeyboardTriggered(false);
                        }
                    }}
                    isKeyboardTriggered={isKeyboardTriggered}
                />
            ) : null}
        </div>
    );
}
