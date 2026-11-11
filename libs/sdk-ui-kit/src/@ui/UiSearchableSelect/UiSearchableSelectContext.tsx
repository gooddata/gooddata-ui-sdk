// (C) 2026 GoodData Corporation

import { type RefObject, createContext, useContext } from "react";

import { type IUiListboxItem } from "../UiListbox/types.js";

interface IUiSearchableSelectContext {
    /** The items matching the search query, with the dividers rendered with them. */
    listboxItems: IUiListboxItem<unknown>[];
    query: string;
    setQuery: (query: string) => void;
    /**
     * Names the listbox: the select's ariaLabelledBy, or the trigger button (named by its ariaLabel), or the
     * ariaLabel itself when there's no button.
     */
    listboxLabelledBy?: string;
    listboxLabel?: string;
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
    shouldCloseOnSelect: boolean;
    /** The search's input, which the full-screen dialog (on mobile) focuses when it opens. */
    searchInputRef: RefObject<HTMLInputElement | null>;
    /** Whether the select is shown full screen (on mobile), where the list fills the screen. */
    isFullscreen: boolean;
    /** The id of the footer, set only when the select has one, so the search can be described by it. */
    footerId?: string;
}

export const UiSearchableSelectContext = createContext<IUiSearchableSelectContext | null>(null);

export function useUiSearchableSelectContext(): IUiSearchableSelectContext {
    const context = useContext(UiSearchableSelectContext);
    if (!context) {
        throw new Error("`useUiSearchableSelectContext` must be used within `UiSearchableSelect`");
    }
    return context;
}
