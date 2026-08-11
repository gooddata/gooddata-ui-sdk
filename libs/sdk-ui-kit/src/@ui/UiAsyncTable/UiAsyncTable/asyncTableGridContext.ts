// (C) 2026 GoodData Corporation

import { type RefObject, createContext, useContext } from "react";

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
