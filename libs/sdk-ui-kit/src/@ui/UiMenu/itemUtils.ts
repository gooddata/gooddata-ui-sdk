// (C) 2025 GoodData Corporation

import { IUiMenuInteractiveItem, IUiMenuItem, IUiMenuItemData } from "./types.js";

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

export const getItem = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    itemId: string,
): IUiMenuItem<T> | undefined => {
    return findItem(items, (item) => item.id === itemId);
};

export const findInteractiveItem = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    predicate: (item: IUiMenuInteractiveItem<T>) => boolean,
): IUiMenuInteractiveItem<T> | undefined => {
    const foundItem = findItem(items, (item) => item.type === "interactive" && predicate(item));

    return foundItem?.type === "interactive" ? foundItem : undefined;
};

export const getInteractiveItem = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    itemId: string,
): IUiMenuInteractiveItem<T> | undefined => {
    return findInteractiveItem(items, (item) => item.id === itemId);
};

export const getItemsByInteractiveParent = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    parentId?: string,
): IUiMenuItem<T>[] | undefined => {
    const isRootLevel = parentId === undefined;

    return isRootLevel ? items : findInteractiveItem(items, (item) => item.id === parentId)?.subItems;
};

export const getItemInteractiveParent = <T extends IUiMenuItemData = object>(
    items: IUiMenuItem<T>[],
    itemId: string,
): IUiMenuInteractiveItem<T> | undefined => {
    const parent = findItem(items, (item) => {
        if (item.type === "static" || item.subItems === undefined) {
            return false;
        }

        return item.subItems.some((subMenuItem) => subMenuItem.id === itemId);
    });

    if (parent?.type === "interactive") {
        return parent;
    }

    if (parent?.type === "group") {
        return getItemInteractiveParent(items, parent.id);
    }

    return undefined;
};

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
