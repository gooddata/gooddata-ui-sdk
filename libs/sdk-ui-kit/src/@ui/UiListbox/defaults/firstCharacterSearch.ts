// (C) 2025 GoodData Corporation

import React from "react";

import { IUiListboxContext } from "../types.js";

/**
 * This is a basic implementation of moving focus to items on character key press.
 * Having this functionality is recommended by the listbox spec.
 */
export function firstCharacterSearch<InteractiveItemData, StaticItemData>(
    event: React.KeyboardEvent,
    {
        items,
        focusedIndex,
        setFocusedIndex,
        isItemFocusable,
    }: IUiListboxContext<InteractiveItemData, StaticItemData>,
) {
    const char = event.key.toLowerCase();

    if (char.length !== 1) {
        return;
    }

    const itemIndex = items.findIndex(
        (item, index) =>
            index > (focusedIndex ?? 0) &&
            isItemFocusable(item) &&
            item.type === "interactive" &&
            item.stringTitle.toLowerCase().startsWith(char),
    );

    if (itemIndex !== -1) {
        setFocusedIndex(itemIndex);
        return;
    }

    // If not found after the current index, start from the beginning
    const fromStartIndex = items.findIndex(
        (item) =>
            isItemFocusable(item) &&
            item.type === "interactive" &&
            item.stringTitle.toLowerCase().startsWith(char),
    );

    if (fromStartIndex !== -1) {
        setFocusedIndex(fromStartIndex);
    }
}
