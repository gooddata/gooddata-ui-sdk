// (C) 2025 GoodData Corporation
import React from "react";
import { b, e } from "./listboxBem.js";
import { makeMenuKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { useAutoupdateRef } from "@gooddata/sdk-ui";
import { DefaultUiListboxInteractiveItemComponent } from "./defaults/DefaultUiListboxInteractiveItemComponent.js";
import { firstCharacterSearch } from "./defaults/firstCharacterSearch.js";
import { IUiListboxContext, IUiListboxInteractiveItem, IUiListboxItem, UiListboxProps } from "./types.js";
import { DefaultUiListboxStaticItemComponent } from "./defaults/DefaultUiListboxStaticItemComponent.js";

/**
 * An accessible listbox component that can be navigated by keyboard.
 * Usable in a <Dropdown /> component.
 * Should implement https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
 *
 * @internal
 */
export function UiListbox<InteractiveItemData, StaticItemData>({
    items,

    dataTestId,
    itemDataTestId,
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
    isDisabledFocusable = false,

    ariaAttributes,
}: UiListboxProps<InteractiveItemData, StaticItemData>): React.ReactNode {
    const isItemFocusable = React.useCallback(
        (item?: IUiListboxItem<InteractiveItemData, StaticItemData>) => {
            if (!item || item.type !== "interactive") {
                return false;
            }

            return isDisabledFocusable || !item.isDisabled;
        },
        [isDisabledFocusable],
    );

    const [focusedIndex, setFocusedIndex] = React.useState<number | undefined>(() => {
        // First try to find the selected item if it's focusable
        const selectedIndex = items.findIndex((item) => item.id === selectedItemId && isItemFocusable(item));
        if (selectedIndex >= 0) {
            return selectedIndex;
        }

        // Otherwise find the first focusable item
        const firstFocusableIndex = items.findIndex(isItemFocusable);
        return firstFocusableIndex >= 0 ? firstFocusableIndex : undefined;
    });

    const itemRefs = React.useRef<(HTMLLIElement | null)[]>([]);

    // Update refs array size when items change. The actual refs are updated during render.
    React.useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, items.length);
    }, [items]);

    const focusedItem = focusedIndex == null ? undefined : items[focusedIndex];
    const focusedItemNode = focusedIndex == null ? undefined : itemRefs.current[focusedIndex];

    // Scroll focused item into view
    React.useEffect(() => {
        if (!focusedItemNode) {
            return;
        }

        focusedItemNode.scrollIntoView({ block: "nearest" });
    }, [focusedItemNode]);

    const handleSelectItem = React.useCallback(
        (item?: IUiListboxInteractiveItem<InteractiveItemData>) => {
            if (!item || item.isDisabled) {
                return;
            }
            onSelect?.(item);
            shouldCloseOnSelect && onClose?.();
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
    const handleKeyDown = React.useMemo(
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
                    onSelect: () => {
                        focusedItem && focusedItem.type === "interactive" && handleSelectItem(focusedItem);
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
        <div className={b()} style={{ maxWidth, maxHeight }} data-testid={dataTestId}>
            <ul
                className={e("items")}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                aria-activedescendant={makeItemId(ariaAttributes.id, focusedItem)}
                {...ariaAttributes}
                role="listbox"
            >
                {items.map((item, index) =>
                    item.type === "interactive" ? (
                        <li
                            key={item.id}
                            ref={(el) => (itemRefs.current[index] = el)}
                            role="option"
                            aria-selected={item.id === selectedItemId}
                            aria-disabled={item.isDisabled}
                            tabIndex={-1}
                            id={makeItemId(ariaAttributes.id, item)}
                            data-testid={itemDataTestId}
                        >
                            <InteractiveItemComponent
                                onSelect={() => {
                                    handleSelectItem(item);
                                }}
                                item={item}
                                isFocused={index === focusedIndex}
                                isSelected={item.id === selectedItemId}
                            />
                        </li>
                    ) : (
                        <li
                            key={item.id ?? index}
                            ref={(el) => (itemRefs.current[index] = el)}
                            data-testid={itemDataTestId}
                        >
                            <StaticItemComponent item={item} />
                        </li>
                    ),
                )}
            </ul>
        </div>
    );
}

const makeItemId = (listboxId: string, item?: IUiListboxItem<unknown, unknown>) =>
    item && item.type === "interactive" ? `item-${listboxId}-${item.id}` : undefined;
