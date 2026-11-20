// (C) 2026 GoodData Corporation

import { type Ref, type RefObject, createContext, useContext } from "react";

/**
 * Ref to the grid element that holds the table's real DOM focus.
 *
 * The table is a composite widget: the grid is its single tab stop and the active row/cell is tracked
 * virtually via aria-activedescendant (row controls are kept out of the tab order). Layers opened from a
 * row therefore return focus here rather than to the control that opened them.
 */
const AsyncTableGridRefContext = createContext<RefObject<HTMLElement | null> | null>(null);

export const AsyncTableGridRefProvider = AsyncTableGridRefContext.Provider;

export const useAsyncTableGridRef = () => useContext(AsyncTableGridRefContext);

interface IAsyncTableInteraction {
    isInteractionMode: boolean;
    activeCellId: string | undefined;
    isKeyboardActivationRef: { current: boolean };
}

const AsyncTableInteractionContext = createContext<IAsyncTableInteraction>({
    isInteractionMode: false,
    activeCellId: undefined,
    isKeyboardActivationRef: { current: false },
});
export const AsyncTableInteractionProvider = AsyncTableInteractionContext.Provider;
export const useAsyncTableInteraction = () => useContext(AsyncTableInteractionContext);

const AsyncTableCellContext = createContext<boolean | null>(null);
export const AsyncTableCellProvider = AsyncTableCellContext.Provider;

/**
 * Tab index for a control rendered inside a UiAsyncTable cell.
 *
 * The grid is the table's single tab stop, so a cell's controls stay out of the tab order while the
 * grid is browsed with the arrow keys and become tabbable only while their cell is in interaction mode
 * (entered with Enter or F2). Returns undefined outside a table cell, so the control keeps its default.
 *
 * Controls opt in: the grid does not change the tab index of what a column renders. A control rendered
 * by a column, such as a native button from `renderButton`, stays in the page tab order unless it
 * passes this value as its `tabIndex` or manages its `tabIndex` itself, for example with `-1`. Such a
 * control is still reached in interaction mode, because the grid moves focus between a cell's controls.
 *
 * @internal
 */
export const useUiAsyncTableCellControlTabIndex = (): 0 | -1 | undefined => {
    const isInteractive = useContext(AsyncTableCellContext);
    if (isInteractive === null) {
        return undefined;
    }
    return isInteractive ? 0 : -1;
};

interface IAsyncTableHeaderNavigation {
    focusedColumnIndex?: number;
    focusedElementRef: Ref<HTMLElement>;
    isTooltipOpen: boolean;
    getHeaderId: (index: number) => string;
}

const AsyncTableHeaderNavigationContext = createContext<IAsyncTableHeaderNavigation | null>(null);
export const AsyncTableHeaderNavigationProvider = AsyncTableHeaderNavigationContext.Provider;
export const useAsyncTableHeaderNavigation = () => useContext(AsyncTableHeaderNavigationContext);
