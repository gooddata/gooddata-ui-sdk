// (C) 2025-2026 GoodData Corporation

import { useState } from "react";

import { isGrandTotalColumnDefinition, isSubtotalColumnDefinition } from "@gooddata/sdk-ui";

import { useColumnDefs } from "../../context/ColumnDefsContext.js";
import { resolveTotalLabelTargetFromColumnDefinition } from "../../features/aggregations/totalLabelTarget.js";
import { e } from "../../features/styling/bem.js";
import { useHeaderCellAriaLabel } from "../../hooks/header/useHeaderCellAriaLabel.js";
import { useHeaderMenu } from "../../hooks/header/useHeaderMenu.js";
import { useHeaderMenuKeyboard } from "../../hooks/header/useHeaderMenuKeyboard.js";
import { useHeaderSpaceKey } from "../../hooks/header/useHeaderSpaceKey.js";
import { useTotalLabelHeader } from "../../hooks/header/useTotalLabelHeader.js";
import { useIsTransposed } from "../../hooks/shared/useIsTransposed.js";
import {
    getPivotHeaderClickableAreaTestIdProps,
    getPivotHeaderTestIdProps,
    getPivotHeaderTextTestIdProps,
} from "../../testing/dataTestIdGenerators.js";
import { type AgGridColumnDef, type AgGridHeaderParams } from "../../types/agGrid.js";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import { HeaderKeyboardHint, isFirstDisplayedColumn } from "./HeaderKeyboardHint.js";
import { SortIndicator } from "./SortIndicator.js";
import {
    getColumnMeasureIdentifier,
    getColumnScope,
    getPivotAttributeDescriptors,
    isValueColumnDef,
} from "./utils/common.js";

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
    // In a non-transposed table, a total/subtotal column's leaf headers still carry the total's
    // column definition (that's how they pick up total/subtotal styling), but they display the
    // measure name, not the total's own label - PivotGroupHeader owns that label there. Only in a
    // transposed table does this header cell represent the total's own label.
    const totalLabelTarget = isTransposed
        ? resolveTotalLabelTargetFromColumnDefinition(columnDefinition)
        : undefined;
    const { label: customTotalLabel, onClick: handleTotalLabelClick } = useTotalLabelHeader(
        params.eGridHeader,
        totalLabelTarget,
    );
    const isValueColDef = isValueColumnDef(columnDefinition);
    const columnScope = getColumnScope(columnDefinition);
    const pivotAttributeDescriptors = getPivotAttributeDescriptors(columnScope);
    const measureIdentifier = getColumnMeasureIdentifier(columnScope);

    const isRegularValueColumn = columnDefinition?.type === "value";
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
        {
            measureIdentifiers: measureIdentifier ? [measureIdentifier] : [],
            pivotAttributeDescriptors,
            ariaLabelDisplayNameOverride: customTotalLabel,
        },
        params,
    );

    useHeaderSpaceKey(params, handleTotalLabelClick ?? handleHeaderClick);
    useHeaderMenuKeyboard(
        params,
        () => {
            setIsKeyboardTriggered(true);
            setIsMenuOpen(true);
        },
        hasMenuItems,
    );
    useHeaderCellAriaLabel(params.eGridHeader, headerCellAriaLabel, params.displayName);

    return (
        <HeaderKeyboardHint
            eGridHeader={params.eGridHeader}
            enabled={isFirstDisplayedColumn(params)}
            canSort={allowSorting}
            canOpenMenu={hasMenuItems}
        >
            <div
                className={e("header-cell", {
                    "is-menu-open": isMenuOpen,
                })}
                onClick={handleTotalLabelClick}
                {...getPivotHeaderTestIdProps({ isTotal, isSubtotal })}
            >
                <div className="gd-header-content" aria-hidden="true">
                    <span className="gd-header-text" {...getPivotHeaderTextTestIdProps()}>
                        {customTotalLabel ?? params.displayName}
                    </span>
                    {!!colDef.sortable && sortDirection ? (
                        <SortIndicator sortDirection={sortDirection} sortIndex={sortIndex} />
                    ) : null}
                </div>
                {!!colDef.sortable && (
                    <div
                        className="gd-header-cell-clickable-area"
                        aria-hidden="true"
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
        </HeaderKeyboardHint>
    );
}
