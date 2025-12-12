// (C) 2025 GoodData Corporation

import { type MouseEvent, useCallback, useState } from "react";

import { type ColGroupDef } from "ag-grid-enterprise";

import { isGrandTotalColumnDefinition, isSubtotalColumnDefinition } from "@gooddata/sdk-ui";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import { getColumnScope, getPivotAttributeDescriptors, isValueColumnDef } from "./utils/common.js";
import { e } from "../../features/styling/bem.js";
import { useHeaderGroupDrilling } from "../../hooks/header/useHeaderGroupDrilling.js";
import { useHeaderMenu } from "../../hooks/header/useHeaderMenu.js";
import { useHeaderMenuKeyboard } from "../../hooks/header/useHeaderMenuKeyboard.js";
import { useHeaderSpaceKey } from "../../hooks/header/useHeaderSpaceKey.js";
import { useIsTransposed } from "../../hooks/shared/useIsTransposed.js";
import {
    getPivotHeaderClickableAreaTestIdProps,
    getPivotHeaderTestIdProps,
    getPivotHeaderTextTestIdProps,
} from "../../testing/dataTestIdGenerators.js";
import { type AgGridColumnGroupDef, type AgGridHeaderGroupParams } from "../../types/agGrid.js";

interface IHeaderGroupCellProps extends AgGridHeaderGroupParams {
    measureIdentifiers: string[];
    pivotGroupDepth?: number;
}

/**
 * Renderer for pivot group header.
 */
export function PivotGroupHeader(params: IHeaderGroupCellProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isKeyboardTriggered, setIsKeyboardTriggered] = useState(false);
    const isTransposed = useIsTransposed();
    const colGroupDef = params.columnGroup.getColGroupDef() as AgGridColumnGroupDef | null;

    const columnDefinition = colGroupDef?.context?.columnDefinition;
    const isValueColDef = isValueColumnDef(columnDefinition);
    const columnScope = getColumnScope(columnDefinition);
    const pivotAttributeDescriptors = getPivotAttributeDescriptors(columnScope);

    const isRegularValueColumn = columnDefinition && columnDefinition.type === "value";
    const isTotal = !isRegularValueColumn && isGrandTotalColumnDefinition(columnDefinition);
    const isTotalGroup =
        !!colGroupDef &&
        !isRegularValueColumn &&
        (colGroupDef as ColGroupDef).children?.some((child) =>
            isGrandTotalColumnDefinition(child.context?.columnDefinition),
        );
    const isSubtotal = !isRegularValueColumn && isSubtotalColumnDefinition(columnDefinition);
    const isSubtotalGroup =
        !!colGroupDef &&
        !isRegularValueColumn &&
        (colGroupDef as ColGroupDef).children?.some((child) =>
            isSubtotalColumnDefinition(child.context?.columnDefinition),
        );

    const isTotalHeader = isTotal || isTotalGroup;
    const isSubtotalHeader = isSubtotal || isSubtotalGroup;

    const allowAggregations =
        params.pivotGroupDepth !== 0 && // Not description level of the pivoting group
        isValueColDef &&
        !isTransposed;
    // PivotGroup cells have header wrapping option but only the ones in depth 0.
    // All other pivotGroup cells underneath and measures underneath do not have wrapping menu option
    const allowTextWrapping = isValueColDef && params.pivotGroupDepth === 0;
    const includeHeaderWrapping = true;
    const includeCellWrapping = false;
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
            includeHeaderWrapping,
            includeCellWrapping,
        },
        {
            measureIdentifiers: params.measureIdentifiers,
            pivotAttributeDescriptors,
        },
        params,
    );

    const hasMenuItems = aggregationsItems.length > 0 || textWrappingItems.length > 0;

    const { handleHeaderDrill, isDrillable } = useHeaderGroupDrilling(params);

    // Click handler for drilling (no sorting for group headers)
    const handleHeaderClick = useCallback(
        (e: MouseEvent<HTMLDivElement> | KeyboardEvent) => {
            if (isDrillable) {
                handleHeaderDrill(e);
            }
        },
        [isDrillable, handleHeaderDrill],
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
            {...getPivotHeaderTestIdProps({
                drillable: isDrillable,
                isTotal: isTotalHeader,
                isSubtotal: isSubtotalHeader,
            })}
        >
            <div className="gd-header-content">
                <span className="gd-header-text" {...getPivotHeaderTextTestIdProps()}>
                    {params.displayName}
                </span>
            </div>
            {isDrillable ? (
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
