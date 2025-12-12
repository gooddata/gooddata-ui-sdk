// (C) 2025 GoodData Corporation

import {
    type IUiMenuContentItem,
    type IUiMenuFocusableItem,
    type IUiMenuInteractiveItem,
    type IUiMenuItem,
    type IUiMenuItemData,
} from "./types.js";

/**
 * Recursively finds an item in the menu tree that matches the predicate.
 * @internal
 */
export const findItem = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    predicate: (item: IUiMenuItem<T>) => boolean,
): IUiMenuItem<T> | undefined => {
    for (const item of items) {
        if (predicate(item)) {
            return item;
        }

        if ((item.type === "interactive" || item.type === "group") && item.subItems !== undefined) {
            const foundItemInSubMenu = findItem(item.subItems, predicate);

            if (foundItemInSubMenu) {
                return foundItemInSubMenu;
            }
        }
    }
    return undefined;
};

/**
 * Gets a menu item by its ID.
 * @internal
 */
export const getItem = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    itemId: string,
): IUiMenuItem<T> | undefined => {
    return findItem(items, (item) => item.id === itemId);
};

/**
 * Finds an interactive menu item that matches the predicate.
 * @internal
 */
export const findInteractiveItem = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    predicate: (item: IUiMenuInteractiveItem<T>) => boolean,
): IUiMenuInteractiveItem<T> | undefined => {
    const foundItem = findItem(items, (item) => item.type === "interactive" && predicate(item));

    return foundItem?.type === "interactive" ? foundItem : undefined;
};

/**
 * Finds a content menu item that matches the predicate.
 * @internal
 */
export const findContentItem = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    predicate: (item: IUiMenuContentItem<T>) => boolean,
): IUiMenuContentItem<T> | undefined => {
    const foundItem = findItem(items, (item) => item.type === "content" && predicate(item));

    return foundItem?.type === "content" ? foundItem : undefined;
};

/**
 * Gets an interactive menu item by its ID.
 * @internal
 */
export const getInteractiveItem = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    itemId: string,
): IUiMenuInteractiveItem<T> | undefined => {
    return findInteractiveItem(items, (item) => item.id === itemId);
};

/**
 * Gets a content menu item by its ID.
 * @internal
 */
export const getContentItem = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    itemId: string,
): IUiMenuContentItem<T> | undefined => {
    return findContentItem(items, (item) => item.id === itemId);
};

/**
 * Gets a focusable (either interactive or content) menu item by its ID.
 * @internal
 */
export const getFocusableItem = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    itemId: string,
): IUiMenuFocusableItem | undefined => {
    return getContentItem(items, itemId) || getInteractiveItem(items, itemId);
};

/**
 * Gets all items under a specific interactive parent item.
 * @internal
 */
export const getItemsByInteractiveParent = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    parentId?: string,
): IUiMenuItem<T>[] | undefined => {
    const isRootLevel = parentId === undefined;

    return isRootLevel ? items : findInteractiveItem(items, (item) => item.id === parentId)?.subItems;
};

/**
 * Gets the interactive parent of a menu item.
 * @internal
 */
export const getItemInteractiveParent = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    itemId: string,
): IUiMenuInteractiveItem<T> | undefined => {
    const parent = findItem(items, (item) => {
        if (
            item.type === "static" ||
            (item.type === "interactive" && item.subItems === undefined) ||
            item.type === "content"
        ) {
            return false;
        }

        return item.subItems?.some((subMenuItem) => subMenuItem.id === itemId) ?? false;
    });

    if (parent?.type === "interactive") {
        return parent;
    }

    if (parent?.type === "group") {
        return getItemInteractiveParent(items, parent.id);
    }

    return undefined;
};

/**
 * Gets all sibling items of a menu item.
 * @internal
 */
export const getSiblingItems = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    itemId: string,
): IUiMenuItem<T>[] | undefined => {
    // If itemId is provided but the item doesn't exist, return undefined
    if (!getItem(items, itemId)) {
        return undefined;
    }

    return getItemsByInteractiveParent(items, getItemInteractiveParent(items, itemId)?.id);
};

/**
 * Gets all next sibling items of a menu item with wraparound.
 * @internal
 */
export const getNextSiblings = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    itemId: string,
): IUiMenuItem<T>[] => {
    const siblingItems = getSiblingItems(items, itemId);
    const itemIndex = siblingItems?.findIndex((item) => item.id === itemId) ?? -1;

    if (itemIndex === -1 || !siblingItems) {
        return [];
    }

    // Wraparound
    return [...siblingItems.slice(itemIndex + 1), ...siblingItems.slice(0, itemIndex)];
};

/**
 * Gets all previous sibling items of a menu item with wraparound.
 * @internal
 */
export const getPreviousSiblings = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    itemId: string,
): IUiMenuItem<T>[] => {
    const siblingItems = getSiblingItems(items, itemId);
    const itemIndex = siblingItems?.findIndex((item) => item.id === itemId) ?? -1;

    if (itemIndex === -1 || !siblingItems) {
        return [];
    }

    // Wraparound
    return [...siblingItems.slice(0, itemIndex).reverse(), ...siblingItems.slice(itemIndex + 1).reverse()];
};

/**
 * Gets the closest focusable sibling item in the specified direction.
 * @internal
 */
export const getClosestFocusableSibling = <T extends IUiMenuItemData = object>(args: {
    items: IUiMenuItem<T>[];
    isItemFocusable: (item: IUiMenuItem<T>) => boolean;
    itemId?: string;
    direction: "forward" | "backward";
}): IUiMenuItem<T> | undefined => {
    const { items, isItemFocusable, itemId, direction } = args;

    const unwrappedItems = unwrapGroupItems(items);

    switch (direction) {
        case "forward":
            if (itemId === undefined) {
                return unwrappedItems.find(isItemFocusable);
            }
            return getNextSiblings(unwrappedItems, itemId).find(isItemFocusable);
        case "backward":
            if (itemId === undefined) {
                return [...unwrappedItems].reverse().find(isItemFocusable);
            }
            return getPreviousSiblings(unwrappedItems, itemId).find(isItemFocusable);
    }
};

/**
 * Unwraps items from group containers into a flat array.
 * @internal
 */
export function unwrapGroupItems<T extends IUiMenuItemData = object>(items: IUiMenuItem<T>[]) {
    const result: IUiMenuItem<T>[] = [];

    for (const item of items) {
        if (item.type === "group") {
            result.push(...unwrapGroupItems(item.subItems));
            continue;
        }

        if (item.type === "interactive" && item.subItems !== undefined) {
            result.push({ ...item, subItems: unwrapGroupItems(item.subItems) });
            continue;
        }

        result.push(item);
    }

    return result;
}
