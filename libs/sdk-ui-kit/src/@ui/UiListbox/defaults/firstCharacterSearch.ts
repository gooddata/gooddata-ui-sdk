// (C) 2025 GoodData Corporation

import React from "react";

import { IListboxContext } from "../types.js";

/**
 * This is a basic implementation of moving focus to items on character key press.
 * Having this functionality is recommended by the listbox spec.
 */
export function firstCharacterSearch(
    event: React.KeyboardEvent,
    { items, focusedIndex, setFocusedIndex }: IListboxContext<any>,
) {
    const char = event.key.toLowerCase();

    if (char.length !== 1) {
        return;
    }

    const itemIndex = items.findIndex(
        (item, index) =>
            index > focusedIndex && item.stringTitle.toLowerCase().startsWith(char) && !item.isDisabled,
    );

    if (itemIndex !== -1) {
        setFocusedIndex(itemIndex);
        return;
    }

    // If not found after the current index, start from the beginning
    const fromStartIndex = items.findIndex(
        (item) => item.stringTitle.toLowerCase().startsWith(char) && !item.isDisabled,
    );

    if (fromStartIndex !== -1) {
        setFocusedIndex(fromStartIndex);
    }
}
