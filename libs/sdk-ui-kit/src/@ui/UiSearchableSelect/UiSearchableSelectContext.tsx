// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import { type IUiListboxItem } from "../UiListbox/types.js";

interface IUiSearchableSelectContext {
    /** The items matching the search query, with the dividers rendered with them. */
    listboxItems: IUiListboxItem<unknown>[];
    query: string;
    setQuery: (query: string) => void;
    /** The id of the trigger button, which labels the listbox. */
    buttonId: string;
    /** The id of the listbox, which the search points into with aria-activedescendant. */
    listboxId: string;
    /** The highlighted option: the search moves it, the list shows it. */
    focusedItemId: string | null;
    setFocusedItemId: (focusedItemId: string | null) => void;
    /** Whether the search points at the highlighted option (aria-activedescendant). */
    isActiveDescendantShown: boolean;
    setIsActiveDescendantShown: (isActiveDescendantShown: boolean) => void;
    value: string | null;
    onChange: (value: string) => void;
    closeDropdown: () => void;
}

export const UiSearchableSelectContext = createContext<IUiSearchableSelectContext | null>(null);

export function useUiSearchableSelectContext(): IUiSearchableSelectContext {
    const context = useContext(UiSearchableSelectContext);
    if (!context) {
        throw new Error("`useUiSearchableSelectContext` must be used within `UiSearchableSelect`");
    }
    return context;
}
