// (C) 2025 GoodData Corporation

import { useEffect, useMemo, useState } from "react";

import { useAutoupdateRef } from "@gooddata/sdk-ui";

import { makeTabsKeyboardNavigation } from "../@utils/keyboardNavigation.js";

/**
 * Simple keyboard navigation hook for horizontal tabs.
 * - ArrowLeft/ArrowRight (or ArrowUp/ArrowDown): Navigate between tabs
 * - Home/End: Jump to first/last tab
 * - Enter/Space: Select the focused tab
 * - Tab key works naturally to move to actions button when focused
 *
 * @internal
 */
export function useTabsKeyboardNavigation<Item>({
    items,
    onSelect,
    focusedIndex: focusedIndexProp,
}: {
    items: Item[];
    onSelect: (item: Item) => void;
    focusedIndex?: number;
}) {
    const [focusedIndex, setFocusedIndex] = useState<number>(focusedIndexProp ?? 0);

    useEffect(() => {
        if (focusedIndexProp !== undefined) {
            setFocusedIndex(focusedIndexProp);
        }
    }, [focusedIndexProp]);

    // If the items change and we're suddenly focusing on a nonexistent item
    if (focusedIndex > items.length - 1) {
        setFocusedIndex(Math.max(0, items.length - 1));
    }

    const focusedItem = items[focusedIndex];

    const depsRef = useAutoupdateRef({
        items,
        focusedIndex,
        focusedItem,
        onSelect,
        setFocusedIndex,
    });

    const onKeyDown = useMemo(
        () =>
            makeTabsKeyboardNavigation({
                onFocusPrevious: () => {
                    const { setFocusedIndex, items } = depsRef.current;
                    setFocusedIndex((currentIndex) =>
                        currentIndex === 0 ? items.length - 1 : currentIndex - 1,
                    );
                },
                onFocusNext: () => {
                    const { setFocusedIndex, items } = depsRef.current;
                    setFocusedIndex((currentIndex) =>
                        currentIndex === items.length - 1 ? 0 : currentIndex + 1,
                    );
                },
                onFocusFirst: () => {
                    const { setFocusedIndex } = depsRef.current;
                    setFocusedIndex(0);
                },
                onFocusLast: () => {
                    const { setFocusedIndex, items } = depsRef.current;
                    setFocusedIndex(items.length - 1);
                },
                onSelect: () => {
                    const { focusedItem, onSelect } = depsRef.current;
                    if (focusedItem) {
                        onSelect(focusedItem);
                    }
                },
            }),
        [depsRef],
    );

    return {
        onKeyDown,
        focusedItem,
        focusedIndex,
        setFocusedIndex,
    };
}
