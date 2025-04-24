// (C) 2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { useId } from "../../utils/useId.js";
import { b, e } from "./listboxBem.js";
import { makeMenuKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import { useAutoupdateRef } from "@gooddata/sdk-ui";
import { DefaultUiListboxItemComponent } from "./defaults/DefaultUiListboxItemComponent.js";
import { firstCharacterSearch } from "./defaults/firstCharacterSearch.js";
import { IListboxContext, IUiListboxItem, UiListboxProps } from "./types.js";

/**
 * An accessible listbox component that can be navigated by keyboard.
 * Usable in a <Dropdown /> component.
 * Should implement https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
 *
 * @internal
 */
export function UiListbox<T>({
    items,
    className,
    maxWidth,
    onSelect,
    onClose,
    selectedItemId,
    ariaAttributes,

    shouldKeyboardActionPreventDefault,
    shouldKeyboardActionStopPropagation,

    ItemComponent = DefaultUiListboxItemComponent,
    onUnhandledKeyDown = firstCharacterSearch,
}: UiListboxProps<T>): React.ReactNode {
    const [focusedIndex, setFocusedIndex] = React.useState<number>(() => {
        // First try to find the selected item if it's not disabled
        const selectedIndex = items.findIndex((item) => item.id === selectedItemId && !item.isDisabled);
        if (selectedIndex >= 0) {
            return selectedIndex;
        }

        // Otherwise find the first non-disabled item
        const firstNonDisabledIndex = items.findIndex((item) => !item.isDisabled);
        return firstNonDisabledIndex >= 0 ? firstNonDisabledIndex : 0;
    });

    const itemRefs = React.useRef<(HTMLLIElement | null)[]>([]);

    // Update refs array size when items change. The actual refs are updated during render.
    React.useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, items.length);
    }, [items]);

    // Scroll focused item into view
    React.useEffect(() => {
        const focusedItem = itemRefs.current[focusedIndex];
        if (focusedItem) {
            focusedItem.scrollIntoView({ block: "nearest" });
        }
    }, [focusedIndex]);

    const handleSelectItem = React.useCallback(
        (item?: IUiListboxItem<T>) => {
            if (!item || item.isDisabled) {
                return;
            }
            onSelect?.(item);
            onClose?.();
        },
        [onClose, onSelect],
    );

    const contextRef = useAutoupdateRef<IListboxContext<T>>({
        itemRefs,
        focusedIndex,
        items,
        onClose,
        onSelect: handleSelectItem,
        setFocusedIndex,
        selectedItemId,
    });
    const handleKeyDown = React.useMemo(
        () =>
            makeMenuKeyboardNavigation({
                shouldPreventDefault: shouldKeyboardActionPreventDefault,
                shouldStopPropagation: shouldKeyboardActionStopPropagation,

                onFocusPrevious: () => {
                    setFocusedIndex((prevIndex) => {
                        let newIndex = prevIndex - 1;
                        // Skip disabled items
                        while (newIndex >= 0 && items[newIndex].isDisabled) {
                            newIndex--;
                        }
                        return newIndex >= 0 ? newIndex : prevIndex;
                    });
                },
                onFocusNext: () => {
                    setFocusedIndex((prevIndex) => {
                        let newIndex = prevIndex + 1;
                        // Skip disabled items
                        while (newIndex < items.length && items[newIndex].isDisabled) {
                            newIndex++;
                        }
                        return newIndex < items.length ? newIndex : prevIndex;
                    });
                },
                onFocusFirst: () => {
                    // Find the first non-disabled item
                    const firstNonDisabledIndex = items.findIndex((item) => !item.isDisabled);
                    setFocusedIndex(firstNonDisabledIndex >= 0 ? firstNonDisabledIndex : 0);
                },
                onFocusLast: () => {
                    // Find the last non-disabled item
                    for (let i = items.length - 1; i >= 0; i--) {
                        if (!items[i].isDisabled) {
                            setFocusedIndex(i);
                            return;
                        }
                    }
                    setFocusedIndex(items.length - 1);
                },
                onSelect: () => {
                    handleSelectItem(items[focusedIndex]);
                },
                onClose: () => {
                    onClose?.();
                },
                onUnhandledKeyDown: (event) => {
                    onUnhandledKeyDown(event, contextRef.current);
                },
            }),
        [
            contextRef,
            focusedIndex,
            handleSelectItem,
            items,
            onClose,
            onUnhandledKeyDown,
            shouldKeyboardActionPreventDefault,
            shouldKeyboardActionStopPropagation,
        ],
    );

    const listboxId = useId();

    return (
        <div className={cx(b(), className)} style={{ maxWidth }}>
            <ul
                role="listbox"
                className={e("items")}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                aria-activedescendant={makeItemId(listboxId, items[focusedIndex])}
                {...ariaAttributes}
            >
                {items.map((item, index) => (
                    <li
                        key={item.id}
                        ref={(el) => (itemRefs.current[index] = el)}
                        role="option"
                        aria-selected={item.id === selectedItemId}
                        aria-disabled={item.isDisabled}
                        tabIndex={-1}
                        id={makeItemId(listboxId, item)}
                    >
                        <ItemComponent
                            onSelect={() => {
                                handleSelectItem(item);
                            }}
                            item={item}
                            isFocused={index === focusedIndex}
                            isSelected={item.id === selectedItemId}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

const makeItemId = (listboxId: string, item: IUiListboxItem<unknown>) => `item-${listboxId}-${item.id}`;
