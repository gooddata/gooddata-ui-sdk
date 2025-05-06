// (C) 2022-2025 GoodData Corporation

import React from "react";
import { IUiMenuContext, UiMenuProps } from "./types.js";
import { makeMenuKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { getClosestFocusableSibling, getItemParent, getSiblingItems } from "./itemUtils.js";

export function useItemRefs(focusedId: string | undefined) {
    const itemsContainerRef = React.useRef<HTMLElement>(null);
    const itemRefs = React.useRef<{ [id: string]: HTMLElement }>({});

    const setItemRef = React.useCallback(
        (id: string) => (element: HTMLElement | null) => {
            if (!element) {
                delete itemRefs.current[id];
                return;
            }

            if (
                focusedId === id &&
                itemsContainerRef.current &&
                itemsContainerRef.current.scrollHeight > itemsContainerRef.current.clientHeight
            ) {
                element.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }

            itemRefs.current[id] = element;
        },
        [focusedId],
    );

    return { itemRefs, setItemRef, itemsContainerRef };
}

export function useKeyNavigation<InteractiveItemData, StaticItemData>({
    menuContextRef,
    shouldKeyboardActionPreventDefault,
    shouldKeyboardActionStopPropagation,
    onUnhandledKeyDown,
}: {
    menuContextRef: React.MutableRefObject<IUiMenuContext<InteractiveItemData, StaticItemData>>;
    onUnhandledKeyDown: UiMenuProps<InteractiveItemData, StaticItemData>["onUnhandledKeyDown"];
    shouldKeyboardActionPreventDefault?: boolean;
    shouldKeyboardActionStopPropagation?: boolean;
}) {
    return makeMenuKeyboardNavigation({
        shouldPreventDefault: shouldKeyboardActionPreventDefault,
        shouldStopPropagation: shouldKeyboardActionStopPropagation,

        onFocusPrevious: () => {
            const { setFocusedId, items, isItemFocusable } = menuContextRef.current;

            setFocusedId(
                (prevId) =>
                    getClosestFocusableSibling({
                        direction: "backward",
                        itemId: prevId,
                        items,
                        isItemFocusable,
                    })?.id ?? prevId,
            );
        },
        onFocusNext: () => {
            const { setFocusedId, items, isItemFocusable } = menuContextRef.current;

            setFocusedId(
                (prevId) =>
                    getClosestFocusableSibling({
                        direction: "forward",
                        itemId: prevId,
                        items,
                        isItemFocusable,
                    })?.id ?? prevId,
            );
        },
        onFocusFirst: () => {
            const { items, isItemFocusable, setFocusedId } = menuContextRef.current;

            setFocusedId((prevId) => {
                if (prevId === undefined) {
                    return items.find(isItemFocusable)?.id;
                }

                return getSiblingItems(items, prevId)?.find(isItemFocusable)?.id;
            });
        },
        onFocusLast: () => {
            const { items, isItemFocusable, setFocusedId } = menuContextRef.current;

            setFocusedId((prevId) => {
                if (prevId === undefined) {
                    return [...items].reverse().find(isItemFocusable)?.id;
                }

                return [...(getSiblingItems(items, prevId) ?? [])].reverse().find(isItemFocusable)?.id;
            });
        },
        onSelect: () => {
            const { onSelect, focusedItem } = menuContextRef.current;
            onSelect(focusedItem);
        },
        onEnterLevel: () => {
            const { onSelect, focusedItem } = menuContextRef.current;
            onSelect(focusedItem);
        },
        onLeaveLevel: () => {
            const { setFocusedId, items } = menuContextRef.current;

            setFocusedId((prevId) => {
                if (prevId === undefined) {
                    return prevId;
                }

                return getItemParent(items, prevId)?.id ?? prevId;
            });
        },
        onClose: () => {
            menuContextRef.current.onClose?.();
        },
        onUnhandledKeyDown: (event) => {
            onUnhandledKeyDown?.(event, menuContextRef.current);
        },
    });
}
