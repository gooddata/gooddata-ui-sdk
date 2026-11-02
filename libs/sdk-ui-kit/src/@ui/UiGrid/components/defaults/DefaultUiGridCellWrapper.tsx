// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { e } from "../../bem.js";
import { type IUiGridCellWrapperProps } from "../../types.js";

/**
 * @internal
 */
export function DefaultUiGridCellWrapper<T>({
    item,
    isSelected,
    isKeyboardFocused,
    isTabStop,
    cellRef,
    onPick,
    onFocus,
    onBlur,
    Cell,
}: IUiGridCellWrapperProps<T>): ReactNode {
    return (
        <div
            ref={cellRef}
            className={e("cell")}
            role="gridcell"
            aria-selected={isSelected}
            tabIndex={isTabStop ? 0 : -1}
            onClick={onPick}
            onFocus={onFocus}
            onBlur={onBlur}
        >
            <Cell item={item} isSelected={isSelected} isKeyboardFocused={isKeyboardFocused} />
        </div>
    );
}
