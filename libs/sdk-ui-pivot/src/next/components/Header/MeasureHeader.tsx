// (C) 2025 GoodData Corporation

import { useState } from "react";

import { isGrandTotalColumnDefinition, isSubtotalColumnDefinition } from "@gooddata/sdk-ui";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import { SortIndicator } from "./SortIndicator.js";
import {
    getColumnMeasureIdentifier,
    getColumnScope,
    getPivotAttributeDescriptors,
    isValueColumnDef,
} from "./utils/common.js";
import { useColumnDefs } from "../../context/ColumnDefsContext.js";
import { e } from "../../features/styling/bem.js";
import { useHeaderMenu } from "../../hooks/header/useHeaderMenu.js";
import { useHeaderMenuKeyboard } from "../../hooks/header/useHeaderMenuKeyboard.js";
import { useHeaderSpaceKey } from "../../hooks/header/useHeaderSpaceKey.js";
import { useIsTransposed } from "../../hooks/shared/useIsTransposed.js";
import {
    getPivotHeaderClickableAreaTestIdProps,
    getPivotHeaderTestIdProps,
    getPivotHeaderTextTestIdProps,
} from "../../testing/dataTestIdGenerators.js";
import { type AgGridColumnDef, type AgGridHeaderParams } from "../../types/agGrid.js";

/**
 * Renderer for measure header.
 */
export function MeasureHeader(params: AgGridHeaderParams) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isKeyboardTriggered, setIsKeyboardTriggered] = useState(false);
    const isTransposed = useIsTransposed();
    const { isPivoted } = useColumnDefs();

    const colDef = params.column.getColDef() as AgGridColumnDef;
    const columnDefinition = colDef?.context?.columnDefinition;
    const isValueColDef = isValueColumnDef(columnDefinition);
    const columnScope = getColumnScope(columnDefinition);
    const pivotAttributeDescriptors = getPivotAttributeDescriptors(columnScope);
    const measureIdentifier = getColumnMeasureIdentifier(columnScope);

    const isRegularValueColumn = columnDefinition && columnDefinition.type === "value";
    const isTotal = !isRegularValueColumn && isGrandTotalColumnDefinition(columnDefinition);
    const isSubtotal = !isRegularValueColumn && isSubtotalColumnDefinition(columnDefinition);

    const allowAggregations = isValueColDef && !isTransposed;
    // Measure columns:
    // - No wrapping options if table has pivoting
    // - Only header wrapping (no cell) if table has no pivoting (measures are top-most header cells)
    const allowTextWrapping = isValueColDef && !isPivoted;
    const includeHeaderWrapping = true;
    const includeCellWrapping = false;
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
            includeHeaderWrapping,
            includeCellWrapping,
        },
        { measureIdentifiers: measureIdentifier ? [measureIdentifier] : [], pivotAttributeDescriptors },
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
            })}
            {...getPivotHeaderTestIdProps({ isTotal, isSubtotal })}
        >
            <div className="gd-header-content">
                <span className="gd-header-text" {...getPivotHeaderTextTestIdProps()}>
                    {params.displayName}
                </span>
                {!!colDef.sortable && sortDirection ? (
                    <SortIndicator sortDirection={sortDirection} sortIndex={sortIndex} />
                ) : null}
            </div>
            {!!colDef.sortable && (
                <div
                    className="gd-header-cell-clickable-area"
                    {...getPivotHeaderClickableAreaTestIdProps()}
                    onClick={handleHeaderClick}
                ></div>
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
