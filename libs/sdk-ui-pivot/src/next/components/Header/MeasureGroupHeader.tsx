// (C) 2025 GoodData Corporation

import { useState } from "react";

import { isEmpty } from "lodash-es";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import {
    getColumnMeasureIdentifier,
    getPivotAttributeDescriptorsForMeasureGroup,
    getRowScope,
    isValueRowDef,
} from "./utils/common.js";
import { useColumnDefs } from "../../context/ColumnDefsContext.js";
import { usePivotTableProps } from "../../context/PivotTablePropsContext.js";
import { e } from "../../features/styling/bem.js";
import { useHeaderCellAriaLabel } from "../../hooks/header/useHeaderCellAriaLabel.js";
import { useHeaderMenu } from "../../hooks/header/useHeaderMenu.js";
import { useHeaderMenuKeyboard } from "../../hooks/header/useHeaderMenuKeyboard.js";
import {
    type AgGridCellRendererParams,
    type AgGridColumnDef,
    type AgGridHeaderParams,
} from "../../types/agGrid.js";

/**
 * Renderer for measure group header.
 *
 * This is a special case when measures are in row (transposition).
 *
 * Covers both header cell and value cell as whole column describes headers due to transposition.
 */
export function MeasureGroupHeader(params: AgGridCellRendererParams | AgGridHeaderParams) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isKeyboardTriggered, setIsKeyboardTriggered] = useState(false);
    const { isPivoted } = useColumnDefs();
    const { config } = usePivotTableProps();
    const { columnHeadersPosition } = config;
    const isHeader = isHeaderParams(params);
    const colDef = (isHeader ? params.column.getColDef() : params.colDef) as AgGridColumnDef;
    const cellData = isHeader ? undefined : params.data?.cellDataByColId[colDef.colId!];

    const columnDefinition = cellData?.columnDefinition ?? colDef.context?.columnDefinition;
    const rowDefinition = cellData?.rowDefinition;

    const pivotAttributeDescriptors = getPivotAttributeDescriptorsForMeasureGroup(columnDefinition);
    const rowScope = getRowScope(rowDefinition);
    const measureIdentifier = getColumnMeasureIdentifier(rowScope);

    const allowAggregations = isValueRowDef(rowDefinition);
    // Measure group header: allow text wrapping for header cells when:
    // - there's no pivoting OR
    // - header position is "left" (where measure group header is used as column header)
    const allowTextWrapping = isHeader && (!isPivoted || columnHeadersPosition === "left");
    const includeHeaderWrapping = true;
    // Include cell wrapping options when header position is left
    const includeCellWrapping = columnHeadersPosition === "left";
    const allowSorting = false;
    const allowDrilling = false;

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
        { measureIdentifiers: measureIdentifier ? [measureIdentifier] : [], pivotAttributeDescriptors },
        isHeader ? params : null, // Pass header params for column identification
    );

    const hasMenuItems = aggregationsItems.length > 0 || textWrappingItems.length > 0;

    useHeaderMenuKeyboard(
        isHeader ? params : ({ eGridHeader: undefined } as unknown as AgGridHeaderParams),
        () => {
            setIsKeyboardTriggered(true);
            setIsMenuOpen(true);
        },
        isHeader && hasMenuItems,
    );
    useHeaderCellAriaLabel(isHeader ? params.eGridHeader : undefined, headerCellAriaLabel);

    const effectiveMeasure = rowScope.find((scope) => scope.type === "measureScope");
    // For non-header cells, get the measure name from the row scope's measure descriptor
    // instead of using the formatted value directly. The formatted value contains the measure name from
    // the result headers which may have the original name for renamed custom metrics.
    const displayName = isHeader
        ? params.displayName
        : (effectiveMeasure?.descriptor.measureHeaderItem.name ?? params.value);

    return (
        <div
            className={e("header-cell", {
                "is-menu-open": isMenuOpen,
            })}
        >
            <div className="gd-header-content">
                <span className="gd-header-text">{displayName}</span>
            </div>
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

// Distinguish between header params and cell params here
function isHeaderParams(p: unknown): p is AgGridHeaderParams {
    return !isEmpty(p) && (p as AgGridHeaderParams).displayName !== undefined;
}
