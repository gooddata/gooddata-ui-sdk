// (C) 2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { b, e } from "./menuBem.js";
import { useAutoupdateRef } from "@gooddata/sdk-ui";
import { ControlType, IUiMenuContext, IUiMenuInteractiveItem, IUiMenuItem, UiMenuProps } from "./types.js";
import { DefaultUiMenuInteractiveItemComponent } from "./defaults/DefaultUiMenuInteractiveItemComponent.js";
import { DefaultUiMenuStaticItemComponent } from "./defaults/DefaultUiMenuStaticItemComponent.js";
import { getInteractiveItem, getItemParent, getItemsByParent, getSiblingItems } from "./itemUtils.js";
import { DefaultUiMenuHeaderComponent } from "./defaults/DefaultUiMenuHeaderComponent.js";
import { useItemRefs, useKeyNavigation } from "./hooks.js";

/**
 * An accessible menu component that can be navigated by keyboard.
 * Usable in a <Dropdown /> component.
 * Should implement https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 *
 * @internal
 */
export function UiMenu<InteractiveItemData, StaticItemData>({
    items,

    className,
    itemClassName,
    maxWidth,

    onSelect,
    onClose,
    onUnhandledKeyDown,

    InteractiveItemComponent = DefaultUiMenuInteractiveItemComponent,
    StaticItemComponent = DefaultUiMenuStaticItemComponent,
    MenuHeaderComponent = DefaultUiMenuHeaderComponent,

    shouldKeyboardActionPreventDefault,
    shouldKeyboardActionStopPropagation,
    shouldCloseOnSelect = true,
    isDisabledFocusable = true,

    ariaAttributes,
}: UiMenuProps<InteractiveItemData, StaticItemData>): React.ReactNode {
    const [controlType, setControlType] = React.useState<ControlType>("unknown");

    const menuComponentRef = React.useRef<HTMLMenuElement>(null);

    const isItemFocusable = React.useCallback(
        (item?: IUiMenuItem<InteractiveItemData, StaticItemData>) => {
            if (!item || item.type !== "interactive") {
                return false;
            }

            return isDisabledFocusable || !item.isDisabled;
        },
        [isDisabledFocusable],
    );

    const [focusedId, setFocusedId_internal] = React.useState<string | undefined>(
        () => items.find(isItemFocusable)?.id,
    );
    const setFocusedId = React.useCallback<typeof setFocusedId_internal>((...args) => {
        setFocusedId_internal(...args);
        // Focus is lost when clicking on an item that opens a submenu. We need to refocus the menu.
        menuComponentRef.current?.focus();
    }, []);

    const focusedItem = focusedId === undefined ? undefined : getInteractiveItem(items, focusedId);

    const { itemsContainerRef, itemRefs, setItemRef } = useItemRefs(focusedId);

    const handleSelectItem = React.useCallback(
        (item?: IUiMenuInteractiveItem<InteractiveItemData, StaticItemData>) => {
            if (!item || item.isDisabled) {
                return;
            }

            // If there is no subMenu, select the item
            if (!item.subMenu) {
                onSelect?.(item);
                shouldCloseOnSelect && onClose?.();
                return;
            }

            // Otherwise focus the first focusable child
            const itemToFocus = getItemsByParent(items, item.id)?.filter(isItemFocusable)[0];

            if (!itemToFocus) {
                return;
            }

            setFocusedId(itemToFocus.id);
            menuComponentRef.current?.focus();
        },
        [isItemFocusable, items, onClose, onSelect, setFocusedId, shouldCloseOnSelect],
    );

    const handleFocusItemByMouse = React.useCallback(
        (id: string) => () => {
            if (controlType !== "mouse") {
                return;
            }
            setFocusedId(id);
        },
        [controlType, setFocusedId],
    );

    const context = {
        itemRefs,
        focusedId,
        items,
        focusedItem,
        onClose,
        onSelect: handleSelectItem,
        setFocusedId,
        isItemFocusable,
    };
    const contextRef = useAutoupdateRef<IUiMenuContext<InteractiveItemData, StaticItemData>>(context);

    const handleKeyDown = useKeyNavigation<InteractiveItemData, StaticItemData>({
        menuContextRef: contextRef,
        onUnhandledKeyDown,
        shouldKeyboardActionPreventDefault,
        shouldKeyboardActionStopPropagation,
    });

    const currentMenuLevelItems = React.useMemo(
        () => (focusedId === undefined ? [] : getSiblingItems(items, focusedId) ?? []),
        [items, focusedId],
    );

    const parentItem = focusedId === undefined ? undefined : getItemParent(items, focusedId);
    const handleBack = React.useCallback(() => {
        if (!parentItem) {
            return;
        }

        setFocusedId(parentItem.id);
    }, [parentItem, setFocusedId]);

    return (
        <div
            className={cx(b(), b({ controlType }), className)}
            style={{ maxWidth }}
            onKeyDownCapture={() => setControlType("keyboard")}
            onMouseMoveCapture={() => setControlType("mouse")}
        >
            <MenuHeaderComponent onBack={handleBack} onClose={onClose} parentItem={parentItem} />

            <div
                className={e("items-container")}
                ref={itemsContainerRef as React.MutableRefObject<HTMLDivElement>}
            >
                <menu
                    className={e("items")}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    aria-activedescendant={makeItemId(ariaAttributes.id, focusedItem)}
                    {...ariaAttributes}
                    role="menu"
                    ref={menuComponentRef}
                >
                    {currentMenuLevelItems.map((item, index) =>
                        item.type === "interactive" ? (
                            <li
                                key={item.id}
                                ref={setItemRef(item.id)}
                                role="menuitem"
                                aria-haspopup={item.subMenu ? "menu" : undefined}
                                aria-disabled={item.isDisabled}
                                onMouseMove={handleFocusItemByMouse(item.id)}
                                tabIndex={-1}
                                id={makeItemId(ariaAttributes.id, item)}
                                className={
                                    typeof itemClassName === "function" ? itemClassName(item) : itemClassName
                                }
                            >
                                <InteractiveItemComponent
                                    onSelect={() => {
                                        handleSelectItem(item);
                                    }}
                                    item={item}
                                    isFocused={item.id === focusedId}
                                />
                            </li>
                        ) : (
                            <li
                                role="none"
                                key={item.id ?? index}
                                className={
                                    typeof itemClassName === "function" ? itemClassName(item) : itemClassName
                                }
                            >
                                <StaticItemComponent item={item} />
                            </li>
                        ),
                    )}
                </menu>
            </div>
        </div>
    );
}

const makeItemId = (listboxId: string, item?: IUiMenuItem<unknown, unknown>) =>
    item && item.type === "interactive" ? `item-${listboxId}-${item.id}` : undefined;
