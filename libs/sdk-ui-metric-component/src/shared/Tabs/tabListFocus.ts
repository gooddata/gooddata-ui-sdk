// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

/**
 * Tells the content of the tabs whether the keyboard focus is in their tab list.
 *
 * @remarks
 * Switching the tab mounts the content of the new tab. Content that focuses one of its fields when
 * it appears (a form's initial focus) must not do so while the focus is in the tab list: the user
 * is moving between the tabs there (the arrow keys of the ARIA tabs pattern, or a click on a tab),
 * and the focus stays on the selected tab.
 */
export type IsFocusInTabList = () => boolean;

export const TabListFocusContext = createContext<IsFocusInTabList>(() => false);

export function useIsFocusInTabList(): IsFocusInTabList {
    return useContext(TabListFocusContext);
}
