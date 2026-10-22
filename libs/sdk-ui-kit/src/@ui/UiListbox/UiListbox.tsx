// (C) 2025-2026 GoodData Corporation

import { type MouseEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAutoupdateRef } from "@gooddata/sdk-ui";

import { useMediaQuery } from "../../responsive/useMediaQuery.js";
import { makeMenuKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { scrollIntoView } from "../@utils/scrollIntoView.js";
import { MenuDivider } from "../UiMenu/components/MenuDivider.js";
import { collapseSeparators } from "../UiMenu/itemUtils.js";

import { DefaultUiListboxInteractiveItemComponent } from "./defaults/DefaultUiListboxInteractiveItemComponent.js";
import { DefaultUiListboxStaticItemComponent } from "./defaults/DefaultUiListboxStaticItemComponent.js";
import { firstCharacterSearch } from "./defaults/firstCharacterSearch.js";
import { b, e } from "./listboxBem.js";
import {
    type IUiListboxContext,
    type IUiListboxInteractiveItem,
    type IUiListboxItem,
    type IUiListboxProps,
    type UiListboxView,
} from "./types.js";

const DEFAULT_SUPPORTED_VIEWS: UiListboxView[] = ["mobile", "desktop"];

/**
 * An accessible listbox component that can be navigated by keyboard.
 * Usable in a <Dropdown /> component.
 * Should implement https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
 *
 * @internal
 */
export function UiListbox<InteractiveItemData, StaticItemData>({
    items: rawItems,

    dataTestId,
    itemDataTestId,
    width,
    maxWidth,
    maxHeight,
    onSelect,
    onClose,
    onUnhandledKeyDown = firstCharacterSearch,

    selectedItemId,

    InteractiveItemComponent = DefaultUiListboxInteractiveItemComponent,
    StaticItemComponent = DefaultUiListboxStaticItemComponent,

    shouldKeyboardActionPreventDefault,
    shouldKeyboardActionStopPropagation,
    shouldCloseOnSelect = true,
    shouldSelectOnOptionClick = false,
    isDisabledFocusable = false,
    focusedItemId,
    onFocusedItemIdChange,
    isCompact = false,
    padding = "default",
    supportedViews = DEFAULT_SUPPORTED_VIEWS,

    reference,
    ariaAttributes,
}: IUiListboxProps<InteractiveItemData, StaticItemData>): ReactNode {
    const items = useMemo(() => collapseSeparators(rawItems), [rawItems]);
    const isMobileDevice = useMediaQuery("mobileDevice");
    const isMobile = isMobileDevice && supportedViews.includes("mobile");
    const isItemFocusable = useCallback(
        (item?: IUiListboxItem<InteractiveItemData, StaticItemData>) => {
            if (item?.type !== "interactive") {
                return false;
            }

            return isDisabledFocusable || !item.isDisabled;
        },
        [isDisabledFocusable],
    );

    const [focusedIndex, setFocusedIndex] = useState<number | undefined>(() => {
        // First try to find the selected item if it's focusable
        const selectedIndex = items.findIndex((item) => item.id === selectedItemId && isItemFocusable(item));
        if (selectedIndex >= 0) {
            return selectedIndex;
        }

        // Otherwise find the first focusable item
        const firstFocusableIndex = items.findIndex(isItemFocusable);
        return firstFocusableIndex >= 0 ? firstFocusableIndex : undefined;
    });

    const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

    // Update refs array size when items change. The actual refs are updated during render.
    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, items.length);
    }, [items]);

    // with virtual focus, the highlight comes from the focusedItemId prop instead of the list's own focus
    const isVirtualFocus = focusedItemId !== undefined;
    const virtualFocusedIndex = items.findIndex(
        (item) => item.type === "interactive" && item.id === focusedItemId,
    );
    const shownFocusedIndex = isVirtualFocus
        ? virtualFocusedIndex >= 0
            ? virtualFocusedIndex
            : undefined
        : focusedIndex;
    const focusedItem = focusedIndex == null ? undefined : items[focusedIndex];
    const focusedItemNode = focusedIndex == null ? undefined : itemRefs.current[focusedIndex];

    // where the mouse last moved over the list, and the item it reported there
    const lastMouseRef = useRef({ x: NaN, y: NaN });
    const hoveredItemIdRef = useRef<string | null>(null);
    // Browsers also report mouse events when the items move under a resting mouse, e.g. when the arrow keys
    // scroll the list or a search filters it; such an event, at the same position, must not take the
    // highlight from the keyboard
    const handleItemMouseMove = (event: MouseEvent, itemId: string) => {
        const { x, y } = lastMouseRef.current;
        if (event.clientX !== x || event.clientY !== y) {
            lastMouseRef.current = { x: event.clientX, y: event.clientY };
            hoveredItemIdRef.current = itemId;
            onFocusedItemIdChange?.(itemId);
        }
    };

    // With virtual focus, scroll to the highlight, also when the list mounts; only the list scrolls, see
    // scrollIntoView. A highlight moved by the mouse is under the mouse already, so it isn't scrolled to,
    // like in React Aria.
    const listRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const isHovered = focusedItemId === hoveredItemIdRef.current;
        hoveredItemIdRef.current = null;
        const list = listRef.current;
        const item = shownFocusedIndex === undefined ? null : itemRefs.current[shownFocusedIndex];
        if (isVirtualFocus && list && item && !isHovered) {
            scrollIntoView(list, item);
        }
    }, [isVirtualFocus, shownFocusedIndex, focusedItemId]);

    // Scroll focused item into view (with virtual focus, the effect above scrolls to the outside highlight instead)
    useEffect(() => {
        if (isVirtualFocus || !focusedItemNode) {
            return;
        }

        focusedItemNode.scrollIntoView({ block: "nearest" });
    }, [isVirtualFocus, focusedItemNode]);

    const handleSelectItem = useCallback(
        (
            item?: IUiListboxInteractiveItem<InteractiveItemData>,
            mods?: { newTab?: boolean; type?: "mouse" | "keyboard" },
        ) => {
            if (!item || item.isDisabled) {
                return;
            }
            onSelect?.(item, mods ?? {});
            if (shouldCloseOnSelect) {
                onClose?.();
            }
        },
        [onClose, onSelect, shouldCloseOnSelect],
    );

    const contextRef = useAutoupdateRef<IUiListboxContext<InteractiveItemData, StaticItemData>>({
        itemRefs,
        focusedIndex,
        items,
        onClose,
        onSelect: handleSelectItem,
        setFocusedIndex,
        selectedItemId,
        isItemFocusable,
    });
    const handleKeyDown = useMemo(
        () =>
            makeMenuKeyboardNavigation(
                {
                    onFocusPrevious: () => {
                        setFocusedIndex((prevIndex) => {
                            let newIndex = (prevIndex ?? 0) - 1;
                            // Skip non-focusable items
                            while (newIndex >= 0 && !isItemFocusable(items[newIndex])) {
                                newIndex--;
                            }
                            return newIndex >= 0 ? newIndex : prevIndex;
                        });
                    },
                    onFocusNext: () => {
                        setFocusedIndex((prevIndex) => {
                            let newIndex = (prevIndex ?? 0) + 1;
                            // Skip non-focusable items
                            while (newIndex < items.length && !isItemFocusable(items[newIndex])) {
                                newIndex++;
                            }
                            return newIndex < items.length ? newIndex : prevIndex;
                        });
                    },
                    onFocusFirst: () => {
                        // Find the first focusable item
                        const firstFocusableIndex = items.findIndex(isItemFocusable);
                        setFocusedIndex(firstFocusableIndex >= 0 ? firstFocusableIndex : undefined);
                    },
                    onFocusLast: () => {
                        // Find the last focusable item
                        for (let i = items.length - 1; i >= 0; i--) {
                            if (isItemFocusable(items[i])) {
                                setFocusedIndex(i);
                                return;
                            }
                        }
                        setFocusedIndex(undefined);
                    },
                    onSelect: (e) => {
                        if (focusedItem?.type === "interactive") {
                            handleSelectItem(focusedItem, {
                                type: "keyboard",
                                newTab: e.ctrlKey || e.metaKey,
                            });
                        }
                    },
                    onClose,
                    onUnhandledKeyDown: (event) => {
                        onUnhandledKeyDown(event, contextRef.current);
                    },
                },
                {
                    shouldPreventDefault: shouldKeyboardActionPreventDefault,
                    shouldStopPropagation: shouldKeyboardActionStopPropagation,
                },
            ),
        [
            contextRef,
            focusedItem,
            handleSelectItem,
            isItemFocusable,
            items,
            onClose,
            onUnhandledKeyDown,
            shouldKeyboardActionPreventDefault,
            shouldKeyboardActionStopPropagation,
        ],
    );

    return (
        <div
            className={b({ mobile: isMobile, padding: padding === "none" && "none" })}
            style={{ width, maxWidth, maxHeight }}
            data-testid={dataTestId}
            ref={listRef}
        >
            <ul
                className={e("items", { virtualFocus: isVirtualFocus })}
                ref={reference}
                // with virtual focus, the focus and the keys stay with the outside owner
                tabIndex={isVirtualFocus ? undefined : 0}
                onKeyDown={isVirtualFocus ? undefined : handleKeyDown}
                aria-activedescendant={
                    isVirtualFocus ? undefined : makeItemId(ariaAttributes.id, focusedItem)
                }
                {...ariaAttributes}
                role="listbox"
            >
                {items.map((item, index) => {
                    const testId =
                        item.type === "separator"
                            ? undefined
                            : typeof itemDataTestId === "function"
                              ? itemDataTestId(item)
                              : itemDataTestId;

                    return item.type === "interactive" ? (
                        <li
                            key={item.id}
                            ref={(el) => {
                                itemRefs.current[index] = el;
                            }}
                            id={makeItemId(ariaAttributes.id, item)}
                            role="option"
                            lang={item.lang}
                            aria-selected={item.id === selectedItemId}
                            aria-disabled={item.isDisabled}
                            data-testid={testId}
                            aria-controls={ariaAttributes["aria-controls"]}
                            onMouseMove={
                                isVirtualFocus && isItemFocusable(item)
                                    ? (event) => handleItemMouseMove(event, item.id)
                                    : undefined
                            }
                            // clicks anywhere in the option, also those dispatched on the option element itself
                            onClick={
                                shouldSelectOnOptionClick
                                    ? (event) => {
                                          handleSelectItem(item, {
                                              type: "mouse",
                                              newTab: event.ctrlKey || event.metaKey || event.button === 1,
                                          });
                                      }
                                    : undefined
                            }
                        >
                            <InteractiveItemComponent
                                onSelect={
                                    shouldSelectOnOptionClick
                                        ? // the click bubbles to the listbox, which selects the item
                                          () => {}
                                        : (e) => {
                                              handleSelectItem(item, {
                                                  type: "mouse",
                                                  newTab: e.ctrlKey || e.metaKey || e.button === 1,
                                              });
                                          }
                                }
                                item={item}
                                isFocused={index === shownFocusedIndex}
                                isSelected={item.id === selectedItemId}
                                isCompact={isCompact}
                            />
                        </li>
                    ) : (
                        // Static and separator items are presentational; `role="presentation"`
                        // keeps the <li> out of the a11y tree so it isn't exposed as a `listitem`,
                        // which is an invalid child of `role="listbox"` (only `option`/`group` allowed).
                        <li
                            key={item.id ?? index}
                            ref={(el) => {
                                itemRefs.current[index] = el;
                            }}
                            role="presentation"
                            data-testid={testId}
                        >
                            {item.type === "separator" ? (
                                <MenuDivider />
                            ) : (
                                <StaticItemComponent item={item} />
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export const makeItemId = (listboxId: string, item?: IUiListboxItem<unknown, unknown>) =>
    item?.type === "interactive" ? `item-${listboxId}-${item.id}` : undefined;

/**
 * The next focusable item of the list in a direction; at the first and the last item, it stays there. Without
 * a current item, down starts at the first item and up at the last. Dividers, static and disabled items are
 * skipped. For moving the focusedItemId of a list with virtual focus.
 *
 * @internal
 */
export function getNextFocusableItemId({
    items,
    focusedItemId,
    direction,
}: {
    items: IUiListboxItem<unknown, unknown>[];
    focusedItemId: string | null;
    direction: "down" | "up";
}): string | null {
    const itemIds = items.flatMap((item) =>
        item.type === "interactive" && !item.isDisabled ? [item.id] : [],
    );
    const index = focusedItemId === null ? -1 : itemIds.indexOf(focusedItemId);
    if (index < 0) {
        return (direction === "down" ? itemIds[0] : itemIds.at(-1)) ?? null;
    }
    return itemIds[direction === "down" ? index + 1 : index - 1] ?? focusedItemId;
}
