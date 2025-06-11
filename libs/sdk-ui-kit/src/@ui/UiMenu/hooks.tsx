// (C) 2022-2025 GoodData Corporation

import {
    IUiMenuControlType,
    IUiMenuContext,
    IUiMenuItem,
    UiMenuProps,
    IUiMenuItemData,
    IUiMenuFocusableItem,
} from "./types.js";
import { makeMenuKeyboardNavigation } from "../@utils/keyboardNavigation.js";
import {
    getClosestFocusableSibling,
    getFocusableItem,
    getItemInteractiveParent,
    getItemsByInteractiveParent,
    getSiblingItems,
    unwrapGroupItems,
} from "./itemUtils.js";
import { useAutoupdateRef } from "@gooddata/sdk-ui";
import React from "react";
import {
    DefaultUiMenuInteractiveItem,
    DefaultUiMenuInteractiveItemWrapper,
} from "./components/defaults/DefaultUiMenuInteractiveItem.js";
import { DefaultUiMenuStaticItem } from "./components/defaults/DefaultUiMenuStaticItem.js";
import { DefaultUiMenuGroupItem } from "./components/defaults/DefaultUiMenuGroupItem.js";
import { DefaultUiMenuHeader } from "./components/defaults/DefaultUiMenuHeader.js";
import { v4 as uuid } from "uuid";
import {
    DefaultUiMenuContentItem,
    DefaultUiMenuContentItemWrapper,
} from "./components/defaults/DefaultUiMenuContentItem.js";
import { DefaultUiMenuContent } from "./components/defaults/DefaultUiMenuContent.js";
import { Item } from "./components/Item.js";
import { isElementTextInput } from "../../utils/domUtilities.js";

/**
 * @internal
 */
export function useUiMenuContextValue<T extends IUiMenuItemData = object, M = object>(
    props: UiMenuProps<T, M>,
    menuComponentRef: React.RefObject<HTMLElement>,
    itemsContainerRef: React.RefObject<HTMLElement>,
): IUiMenuContext<T, M> {
    const {
        items,

        itemClassName,
        itemDataTestId,

        onSelect,
        onLevelChange,
        onClose,

        InteractiveItem: InteractiveItemComponent = DefaultUiMenuInteractiveItem,
        InteractiveItemWrapper: InteractiveItemWrapperComponent = DefaultUiMenuInteractiveItemWrapper,
        StaticItem: StaticItemComponent = DefaultUiMenuStaticItem,
        GroupItem: GroupItemComponent = DefaultUiMenuGroupItem,
        MenuHeader: MenuHeaderComponent = DefaultUiMenuHeader,
        ContentItem: ContentItemComponent = DefaultUiMenuContentItem,
        ContentItemWrapper: ContentItemWrapperComponent = DefaultUiMenuContentItemWrapper,
        Content: ContentComponent = DefaultUiMenuContent,

        shouldCloseOnSelect = true,
        isDisabledFocusable = true,

        ariaAttributes,

        menuCtxData,
    } = props;

    const [controlType, setControlType] = React.useState<IUiMenuControlType>("unknown");

    const isItemFocusable = React.useCallback(
        (item?: IUiMenuItem<T>) => {
            if (!item || (item.type !== "interactive" && item.type !== "content")) {
                return false;
            }

            return isDisabledFocusable || !item.isDisabled;
        },
        [isDisabledFocusable],
    );

    const [focusedId, setFocusedId_internal] = React.useState<string | undefined>(
        () => unwrapGroupItems(items).find(isItemFocusable)?.id,
    );

    const [shownCustomContentItemId, setShownCustomContentItemId] = React.useState<string | undefined>(
        undefined,
    );

    const setFocusedId = React.useCallback<typeof setFocusedId_internal>(
        (...args) => {
            setFocusedId_internal(...args);
            // Focus is lost when clicking on an item that opens a submenu. We need to refocus the menu.
            menuComponentRef.current?.focus();
        },
        [menuComponentRef],
    );

    const focusedItem = focusedId !== undefined ? getFocusableItem(items, focusedId) : undefined;

    const parentItemId = React.useMemo(() => {
        if (shownCustomContentItemId) {
            return shownCustomContentItemId;
        }

        if (focusedItem) {
            return getItemInteractiveParent(items, focusedItem.id)?.id;
        }

        return undefined;
    }, [focusedItem, items, shownCustomContentItemId]);

    React.useEffect(() => {
        if (parentItemId) {
            const item = getFocusableItem(items, parentItemId);
            onLevelChange?.(1, item);
        } else {
            onLevelChange?.(0, undefined);
        }
    }, [parentItemId, onLevelChange, items]);

    const handleSelectItem = React.useCallback(
        (item?: IUiMenuFocusableItem<T>) => {
            if (!item || item.isDisabled) {
                return;
            }

            if (item.type === "content") {
                if (item.Component) {
                    setShownCustomContentItemId(item.id);
                }
                return;
            }

            // If there is no submenu, select the item
            if (!item.subItems) {
                onSelect?.(item);
                shouldCloseOnSelect && onClose?.();
                return;
            }

            // Otherwise focus the first focusable child
            const itemToFocus = unwrapGroupItems(getItemsByInteractiveParent(items, item.id) ?? []).filter(
                isItemFocusable,
            )[0];

            if (!itemToFocus) {
                return;
            }

            setFocusedId(itemToFocus.id);
            menuComponentRef.current?.focus();
        },
        [isItemFocusable, items, menuComponentRef, onClose, onSelect, setFocusedId, shouldCloseOnSelect],
    );

    const makeItemId = React.useCallback<IUiMenuContext<T>["makeItemId"]>(
        (item) => {
            if (!item) {
                return undefined;
            }
            return item && (item.type === "interactive" || item.type === "content")
                ? `item-${ariaAttributes.id}-${item.id}`
                : uuid();
        },
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
        setShownCustomContentItemId,
        shownCustomContentItemId,
        onClose,
        items,
        onSelect: handleSelectItem,
        itemClassName,
        itemDataTestId,
        isItemFocusable,
        makeItemId,
        scrollToView,
        menuComponentRef,
        itemsContainerRef,

        InteractiveItemWrapper: InteractiveItemWrapperComponent,
        InteractiveItem: InteractiveItemComponent,

        StaticItem: StaticItemComponent,
        GroupItem: GroupItemComponent,
        MenuHeader: MenuHeaderComponent,
        ContentItemWrapper: ContentItemWrapperComponent,
        ContentItem: ContentItemComponent,
        Content: ContentComponent,
        ItemComponent: Item,
        menuCtxData,
    };
}

/**
 * @internal
 */
export function useKeyNavigation<T extends IUiMenuItemData = object, M extends object = object>({
    menuContextValue,
    shouldKeyboardActionPreventDefault,
    shouldKeyboardActionStopPropagation,
    onUnhandledKeyDown,
}: {
    menuContextValue: IUiMenuContext<T, M>;
    onUnhandledKeyDown: UiMenuProps<T, M>["onUnhandledKeyDown"];
    shouldKeyboardActionPreventDefault?: boolean;
    shouldKeyboardActionStopPropagation?: boolean;
}) {
    const menuContextRef = useAutoupdateRef(menuContextValue);

    return makeMenuKeyboardNavigation(
        {
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

                if (
                    (focusedItem?.type !== "interactive" && focusedItem?.type !== "content") ||
                    (focusedItem?.type === "interactive" && !focusedItem.subItems) ||
                    (focusedItem?.type === "content" && !focusedItem.Component)
                ) {
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
        },
        {
            shouldPreventDefault: shouldKeyboardActionPreventDefault,
            shouldStopPropagation: shouldKeyboardActionStopPropagation,
        },
    );
}

export function useCustomContentKeyNavigation<T extends IUiMenuItemData = object, M extends object = object>({
    menuContextValue,
    shouldKeyboardActionPreventDefault,
    shouldKeyboardActionStopPropagation,
    onUnhandledKeyDown,
}: {
    menuContextValue: IUiMenuContext<T, M>;
    onUnhandledKeyDown: UiMenuProps<T, M>["onUnhandledKeyDown"];
    shouldKeyboardActionPreventDefault?: boolean;
    shouldKeyboardActionStopPropagation?: boolean;
}) {
    const menuContextRef = useAutoupdateRef(menuContextValue);

    return makeMenuKeyboardNavigation(
        {
            onLeaveLevel: () => {
                const isInputFocused = isElementTextInput(document.activeElement);

                if (isInputFocused) {
                    return;
                }

                const { setShownCustomContentItemId } = menuContextRef.current;

                setShownCustomContentItemId(undefined);
            },
            onClose: () => {
                const isInputFocused = isElementTextInput(document.activeElement);

                if (isInputFocused) {
                    return;
                }

                menuContextRef.current.onClose?.();
            },
            onUnhandledKeyDown: (event) => {
                onUnhandledKeyDown?.(event, menuContextRef.current);
            },
        },
        {
            shouldPreventDefault: shouldKeyboardActionPreventDefault,
            shouldStopPropagation: shouldKeyboardActionStopPropagation,
        },
    );
}
