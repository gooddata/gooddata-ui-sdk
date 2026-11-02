// (C) 2026 GoodData Corporation

import { type CSSProperties, type ReactNode } from "react";

import { chunk } from "lodash-es";

import { accessibilityConfigToAttributes } from "../../typings/utilities.js";

import { b, e } from "./bem.js";
import { DefaultUiGridCellWrapper } from "./components/defaults/DefaultUiGridCellWrapper.js";
import { type IUiGridProps } from "./types.js";
import { useUiGridNavigation } from "./useUiGridNavigation.js";

/**
 * @internal
 */
export function UiGrid<T>({
    groups,
    getItemId,
    selectedItemId,
    onPick,
    columns,
    cellWidth,
    gap,
    accessibilityConfig,
    onEscape,
    id,
    dataTestId,
    Cell,
    CellWrapper = DefaultUiGridCellWrapper,
}: IUiGridProps<T>): ReactNode {
    const rows = groups.flatMap((group) => chunk(group, columns));
    const { tabStopId, keyboardFocusedId, cellRef, onCellFocus, onCellBlur, gridHandlers } =
        useUiGridNavigation({
            rows,
            getItemId,
            selectedItemId,
            onPick,
            onEscape,
        });
    const layout = {
        "--ui-grid-columns": columns,
        ...(cellWidth === undefined ? {} : { "--ui-grid-cell-width": `${cellWidth}px` }),
        ...(gap === undefined ? {} : { "--ui-grid-gap": `${gap}px` }),
    } as CSSProperties;

    return (
        <div
            id={id}
            className={b()}
            role="grid"
            {...accessibilityConfigToAttributes(accessibilityConfig)}
            aria-rowcount={rows.length}
            style={layout}
            data-testid={dataTestId}
            {...gridHandlers}
        >
            {rows.map((row, rowIndex) => (
                <div key={rowIndex} className={e("row")} role="row" aria-rowindex={rowIndex + 1}>
                    {row.map((item) => {
                        const itemId = getItemId(item);
                        return (
                            <CellWrapper
                                key={itemId}
                                item={item}
                                isSelected={itemId === selectedItemId}
                                isKeyboardFocused={itemId === keyboardFocusedId}
                                isTabStop={itemId === tabStopId}
                                cellRef={cellRef(itemId)}
                                onPick={() => onPick(item)}
                                onFocus={() => onCellFocus(itemId)}
                                onBlur={() => onCellBlur(itemId)}
                                Cell={Cell}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
