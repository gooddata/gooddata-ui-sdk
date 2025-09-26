// (C) 2025 GoodData Corporation

import { MouseEvent, useCallback, useState } from "react";

import { HeaderMenu } from "./HeaderCell/HeaderMenu.js";
import { useHeaderMenu } from "./hooks/useHeaderMenu.js";
import { getColumnScope, getPivotAttributeDescriptors, isValueColumnDef } from "./utils/common.js";
import { e } from "../../features/styling/bem.js";
import { useIsTransposed } from "../../hooks/shared/useIsTransposed.js";
import { useHeaderGroupDrilling } from "../../hooks/useHeaderGroupDrilling.js";
import { AgGridColumnGroupDef, AgGridHeaderGroupParams } from "../../types/agGrid.js";

interface IHeaderGroupCellProps extends AgGridHeaderGroupParams {
    measureIdentifiers: string[];
    pivotGroupDepth?: number;
}

/**
 * Renderer for pivot group header.
 */
export function PivotGroupHeader(params: IHeaderGroupCellProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isTransposed = useIsTransposed();
    const colGroupDef = params.columnGroup.getColGroupDef() as AgGridColumnGroupDef;

    const columnDefinition = colGroupDef.context.columnDefinition;
    const isValueColDef = isValueColumnDef(columnDefinition);
    const columnScope = getColumnScope(columnDefinition);
    const pivotAttributeDescriptors = getPivotAttributeDescriptors(columnScope);

    const allowAggregations =
        params.pivotGroupDepth !== 0 && // Not description level of the pivoting group
        isValueColDef &&
        !isTransposed;
    const allowTextWrapping = isValueColDef;

    const { aggregationsItems, textWrappingItems, handleAggregationsItemClick, handleTextWrappingItemClick } =
        useHeaderMenu(
            allowAggregations,
            allowTextWrapping,
            params.measureIdentifiers,
            pivotAttributeDescriptors,
            params.api,
        );

    const hasMenuItems = aggregationsItems.length > 0 || textWrappingItems.length > 0;

    const { handleHeaderDrill, isDrillable } = useHeaderGroupDrilling(params);

    // Click handler for drilling (no sorting for group headers)
    const handleHeaderClick = useCallback(
        (e: MouseEvent) => {
            if (isDrillable) {
                handleHeaderDrill(e);
            }
        },
        [isDrillable, handleHeaderDrill],
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
            </div>
            {isDrillable ? (
                <div className="gd-header-cell-clickable-area" onClick={handleHeaderClick}></div>
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
