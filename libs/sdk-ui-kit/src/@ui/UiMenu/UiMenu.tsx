// (C) 2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { b, e } from "./menuBem.js";
import { IUiMenuItemData, UiMenuProps } from "./types.js";
import { getSiblingItems } from "./itemUtils.js";
import { useKeyNavigation, useUiMenuContextValue } from "./hooks.js";
import { typedUiMenuContextStore } from "./context.js";

/**
 * An accessible menu component that can be navigated by keyboard.
 * Usable in a <Dropdown /> component.
 * Should implement https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 *
 * @internal
 */
export function UiMenu<T extends IUiMenuItemData = object>(props: UiMenuProps<T>): React.ReactNode {
    const {
        className,
        maxWidth,
        ariaAttributes,
        onUnhandledKeyDown,
        shouldKeyboardActionPreventDefault,
        shouldKeyboardActionStopPropagation,
    } = props;

    const menuComponentRef = React.useRef<HTMLMenuElement>(null);
    const itemsContainerRef = React.useRef<HTMLDivElement>(null);

    const UiMenuContextStore = typedUiMenuContextStore<T>();
    const contextStoreValue = useUiMenuContextValue(props, menuComponentRef, itemsContainerRef);

    const handleKeyDown = useKeyNavigation<T>({
        menuContextValue: contextStoreValue,
        onUnhandledKeyDown,
        shouldKeyboardActionPreventDefault,
        shouldKeyboardActionStopPropagation,
    });

    const {
        focusedItem,
        items,
        controlType,
        setControlType,
        MenuHeaderComponent,
        ItemComponent,
        makeItemId,
    } = contextStoreValue;
    const focusedId = focusedItem?.id;

    const currentMenuLevelItems = React.useMemo(
        () => (focusedId === undefined ? [] : getSiblingItems(items, focusedId) ?? []),
        [items, focusedId],
    );

    return (
        <UiMenuContextStore value={contextStoreValue}>
            <div
                className={cx(b(), b({ controlType }), className)}
                style={{ maxWidth }}
                onKeyDownCapture={() => setControlType("keyboard")}
                onMouseMoveCapture={() => setControlType("mouse")}
            >
                <MenuHeaderComponent />

                <div
                    className={e("items-container")}
                    ref={itemsContainerRef as React.MutableRefObject<HTMLDivElement>}
                >
                    <menu
                        className={e("items")}
                        tabIndex={0}
                        onKeyDown={handleKeyDown}
                        aria-activedescendant={focusedItem ? makeItemId(focusedItem) : undefined}
                        {...ariaAttributes}
                        role="menu"
                        ref={menuComponentRef}
                    >
                        {currentMenuLevelItems.map((item, index) => (
                            <ItemComponent key={"id" in item ? item.id : index} item={item} />
                        ))}
                    </menu>
                </div>
            </div>
        </UiMenuContextStore>
    );
}
