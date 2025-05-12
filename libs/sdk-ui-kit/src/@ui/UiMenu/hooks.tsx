// (C) 2022-2025 GoodData Corporation

import {
    IUiMenuControlType,
    IUiMenuContext,
    IUiMenuInteractiveItem,
    IUiMenuItem,
    UiMenuItemProps,
    UiMenuProps,
    IUiMenuItemData,
} from "./types.js";
import { makeMenuKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import {
    getClosestFocusableSibling,
    getInteractiveItem,
    getItemInteractiveParent,
    getItemsByInteractiveParent,
    getSiblingItems,
    unwrapGroupItems,
} from "./itemUtils.js";
import { useAutoupdateRef } from "@gooddata/sdk-ui";
import React from "react";
import {
    DefaultUiMenuInteractiveItemComponent,
    DefaultUiMenuInteractiveItemWrapperComponent,
} from "./defaults/DefaultUiMenuInteractiveItemComponent.js";
import { DefaultUiMenuStaticItemComponent } from "./defaults/DefaultUiMenuStaticItemComponent.js";
import { DefaultUiMenuGroupItemComponent } from "./defaults/DefaultUiMenuGroupItemComponent.js";
import { DefaultUiMenuHeaderComponent } from "./defaults/DefaultUiMenuHeaderComponent.js";
import { v4 as uuid } from "uuid";
import { typedUiMenuContextStore } from "./context.js";

/**
 * @internal
 */
export function useUiMenuContextValue<T extends IUiMenuItemData = object>(
    props: UiMenuProps<T>,
    menuComponentRef: React.RefObject<HTMLElement>,
    itemsContainerRef: React.RefObject<HTMLElement>,
): IUiMenuContext<T> {
    const {
        items,

        itemClassName,

        onSelect,
        onClose,

        InteractiveItemComponent = DefaultUiMenuInteractiveItemComponent,
        InteractiveItemWrapperComponent = DefaultUiMenuInteractiveItemWrapperComponent,
        StaticItemComponent = DefaultUiMenuStaticItemComponent,
        GroupItemComponent = DefaultUiMenuGroupItemComponent,
        MenuHeaderComponent = DefaultUiMenuHeaderComponent,

        shouldCloseOnSelect = true,
        isDisabledFocusable = true,

        ariaAttributes,
    } = props;

    const [controlType, setControlType] = React.useState<IUiMenuControlType>("unknown");

    const isItemFocusable = React.useCallback(
        (item?: IUiMenuItem<T>) => {
            if (!item || item.type !== "interactive") {
                return false;
            }

            return isDisabledFocusable || !item.isDisabled;
        },
        [isDisabledFocusable],
    );

    const [focusedId, setFocusedId_internal] = React.useState<string | undefined>(
        () => unwrapGroupItems(items).find(isItemFocusable)?.id,
    );
    const setFocusedId = React.useCallback<typeof setFocusedId_internal>(
        (...args) => {
            setFocusedId_internal(...args);
            // Focus is lost when clicking on an item that opens a submenu. We need to refocus the menu.
            menuComponentRef.current?.focus();
        },
        [menuComponentRef],
    );

    const focusedItem = focusedId === undefined ? undefined : getInteractiveItem(items, focusedId);

    const handleSelectItem = React.useCallback(
        (item?: IUiMenuInteractiveItem<T>) => {
            if (!item || item.isDisabled) {
                return;
            }

            // If there is no submenu, select the item
            if (!item.subItems) {
                onSelect?.(item);
                shouldCloseOnSelect && onClose?.();
                return;
            }

            // Otherwise focus the first focusable child
            const itemToFocus = getItemsByInteractiveParent(items, item.id)?.filter(isItemFocusable)[0];

            if (!itemToFocus) {
                return;
            }

            setFocusedId(itemToFocus.id);
            menuComponentRef.current?.focus();
        },
        [isItemFocusable, items, menuComponentRef, onClose, onSelect, setFocusedId, shouldCloseOnSelect],
    );

    const makeItemId = React.useCallback<IUiMenuContext<T>["makeItemId"]>(
        (item) => (item && item.type === "interactive" ? `item-${ariaAttributes.id}-${item.id}` : uuid()),
        [ariaAttributes.id],
    );

    const scrollToView = React.useCallback<IUiMenuContext<T>["scrollToView"]>(
        (element) => {
            if (!element) {
                return;
            }

            if (
                controlType === "keyboard" &&
                itemsContainerRef.current &&
                itemsContainerRef.current.scrollHeight > itemsContainerRef.current.clientHeight
            ) {
                element.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        },
        [controlType, itemsContainerRef],
    );

    return {
        controlType,
        setControlType,
        setFocusedId,
        focusedItem,
        onClose,
        items,
        onSelect: handleSelectItem,
        itemClassName,
        isItemFocusable,
        makeItemId,
        scrollToView,
        menuComponentRef,
        itemsContainerRef,

        InteractiveItemWrapperComponent,
        InteractiveItemComponent,
        StaticItemComponent,
        GroupItemComponent,
        MenuHeaderComponent,
        ItemComponent,
    };
}

const ItemComponent = React.memo(function ItemComponent<T extends IUiMenuItemData = object>({
    item,
}: UiMenuItemProps<T>) {
    const { InteractiveItemWrapperComponent, StaticItemComponent, GroupItemComponent } =
        typedUiMenuContextStore<T>().useContextStore((ctx) => ({
            InteractiveItemWrapperComponent: ctx.InteractiveItemWrapperComponent,
            StaticItemComponent: ctx.StaticItemComponent,
            GroupItemComponent: ctx.GroupItemComponent,
        }));

    if (item.type === "interactive") {
        return <InteractiveItemWrapperComponent item={item} />;
    }
    if (item.type === "static") {
        return <StaticItemComponent item={item} />;
    }
    if (item.type === "group") {
        return <GroupItemComponent item={item} />;
    }
    return null;
});

/**
 * @internal
 */
export function useKeyNavigation<T extends IUiMenuItemData = object>({
    menuContextValue,
    shouldKeyboardActionPreventDefault,
    shouldKeyboardActionStopPropagation,
    onUnhandledKeyDown,
}: {
    menuContextValue: IUiMenuContext<T>;
    onUnhandledKeyDown: UiMenuProps<T>["onUnhandledKeyDown"];
    shouldKeyboardActionPreventDefault?: boolean;
    shouldKeyboardActionStopPropagation?: boolean;
}) {
    const menuContextRef = useAutoupdateRef(menuContextValue);

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
                    return unwrapGroupItems(items).find(isItemFocusable)?.id;
                }

                return unwrapGroupItems(getSiblingItems(items, prevId) ?? []).find(isItemFocusable)?.id;
            });
        },
        onFocusLast: () => {
            const { items, isItemFocusable, setFocusedId } = menuContextRef.current;

            setFocusedId((prevId) => {
                if (prevId === undefined) {
                    return [...unwrapGroupItems(items)].reverse().find(isItemFocusable)?.id;
                }

                return [...unwrapGroupItems(getSiblingItems(items, prevId) ?? [])]
                    .reverse()
                    .find(isItemFocusable)?.id;
            });
        },
        onSelect: () => {
            const { onSelect, focusedItem } = menuContextRef.current;
            onSelect(focusedItem);
        },
        onEnterLevel: () => {
            const { onSelect, focusedItem } = menuContextRef.current;

            if (focusedItem?.type !== "interactive" || !focusedItem.subItems) {
                return;
            }

            onSelect(focusedItem);
        },
        onLeaveLevel: () => {
            const { setFocusedId, items } = menuContextRef.current;

            setFocusedId((prevId) => {
                if (prevId === undefined) {
                    return prevId;
                }

                return getItemInteractiveParent(items, prevId)?.id ?? prevId;
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
