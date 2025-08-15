// (C) 2025 GoodData Corporation

import React, { useState } from "react";
import { HeaderMenu } from "./HeaderMenu.js";
import { e } from "../../../features/styling/bem.js";
import {
    IAggregationsSubMenuItem,
    IAggregationsMenuItem,
    ITextWrappingMenuItem,
} from "../../../types/menu.js";
import { usePivotTableProps } from "../../../context/PivotTablePropsContext.js";
import { AgGridApi } from "../../../types/agGrid.js";
import { useGetDefaultTextWrapping } from "../../../hooks/textWrapping/useGetDefaultTextWrapping.js";

interface IHeaderCellWithMenuProps {
    displayName: React.ReactNode;
    aggregationsItems: IAggregationsMenuItem[];
    textWrappingItems: ITextWrappingMenuItem[];
    onAggregationsItemClick: (item: IAggregationsSubMenuItem) => void;
    onTextWrappingItemClick: (item: ITextWrappingMenuItem) => void;
    gridApi?: AgGridApi;
}

/**
 * Reusable wrapper component for header cells.
 */
export function HeaderCell({
    displayName,
    aggregationsItems,
    textWrappingItems,
    onAggregationsItemClick,
    onTextWrappingItemClick,
    gridApi,
}: IHeaderCellWithMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { config } = usePivotTableProps();
    const getCurrentTextWrapping = useGetDefaultTextWrapping();
    const currentTextWrapping = getCurrentTextWrapping(gridApi, config.textWrapping);

    // Enable ellipsis text truncation when the header text is not text wrapping
    const useTruncating = !currentTextWrapping.wrapHeaderText;

    if (!aggregationsItems.length && !textWrappingItems.length) {
        return displayName;
    }

    return (
        <div className={e("header-cell-menu", { "is-open": isOpen, truncated: useTruncating })}>
            <HeaderMenu
                aggregationsItems={aggregationsItems}
                textWrappingItems={textWrappingItems}
                onAggregationsItemClick={onAggregationsItemClick}
                onTextWrappingItemClick={onTextWrappingItemClick}
                isMenuOpened={isOpen}
                onMenuOpenedChange={(opened) => setIsOpen(opened)}
            />
            <span>{displayName}</span>
        </div>
    );
}
