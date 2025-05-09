// (C) 2025 GoodData Corporation

import { IUiMenuInteractiveItem, IUiMenuItem } from "./types.js";

export const findItem = <InteractiveItemData, StaticItemData>(
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[],
    predicate: (item: IUiMenuItem<InteractiveItemData, StaticItemData>) => boolean,
): IUiMenuItem<InteractiveItemData, StaticItemData> | undefined => {
    for (const item of items) {
        if (predicate(item)) {
            return item;
        }

        if ("subItems" in item && item.subItems !== undefined) {
            const foundItemInSubMenu = findItem(item.subItems, predicate);

            if (foundItemInSubMenu) {
                return foundItemInSubMenu;
            }
        }
    }
    return undefined;
};

export const getItem = <InteractiveItemData, StaticItemData>(
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[],
    itemId: string,
): IUiMenuItem<InteractiveItemData, StaticItemData> | undefined => {
    return findItem(items, (item) => item.id === itemId);
};

export const findInteractiveItem = <InteractiveItemData, StaticItemData>(
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[],
    predicate: (item: IUiMenuInteractiveItem<InteractiveItemData, StaticItemData>) => boolean,
): IUiMenuInteractiveItem<InteractiveItemData, StaticItemData> | undefined => {
    const foundItem = findItem(items, (item) => item.type === "interactive" && predicate(item));

    return foundItem?.type === "interactive" ? foundItem : undefined;
};

export const getInteractiveItem = <InteractiveItemData, StaticItemData>(
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[],
    itemId: string,
): IUiMenuInteractiveItem<InteractiveItemData, StaticItemData> | undefined => {
    return findInteractiveItem(items, (item) => item.id === itemId);
};

export const getItemsByInteractiveParent = <InteractiveItemData, StaticItemData>(
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[],
    parentId?: string,
): IUiMenuItem<InteractiveItemData, StaticItemData>[] | undefined => {
    const isRootLevel = parentId === undefined;

    return isRootLevel ? items : findInteractiveItem(items, (item) => item.id === parentId)?.subItems;
};

export const getItemInteractiveParent = <InteractiveItemData, StaticItemData>(
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[],
    itemId: string,
): IUiMenuInteractiveItem<InteractiveItemData, StaticItemData> | undefined => {
    const parent = findItem(items, (item) => {
        if (!("subItems" in item) || item.subItems === undefined) {
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

export const getSiblingItems = <InteractiveItemData, StaticItemData>(
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[],
    itemId: string,
): IUiMenuItem<InteractiveItemData, StaticItemData>[] | undefined => {
    // If itemId is provided but the item doesn't exist, return undefined
    if (!getItem(items, itemId)) {
        return undefined;
    }

    return getItemsByInteractiveParent(items, getItemInteractiveParent(items, itemId)?.id);
};

export const getNextSiblings = <InteractiveItemData, StaticItemData>(
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[],
    itemId: string,
): IUiMenuItem<InteractiveItemData, StaticItemData>[] => {
    const siblingItems = getSiblingItems(items, itemId);
    const itemIndex = siblingItems?.findIndex((item) => item.id === itemId) ?? -1;

    if (itemIndex === -1 || !siblingItems) {
        return [];
    }

    // Wraparound
    return [...siblingItems.slice(itemIndex + 1), ...siblingItems.slice(0, itemIndex)];
};

export const getPreviousSiblings = <InteractiveItemData, StaticItemData>(
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[],
    itemId: string,
): IUiMenuItem<InteractiveItemData, StaticItemData>[] => {
    const siblingItems = getSiblingItems(items, itemId);
    const itemIndex = siblingItems?.findIndex((item) => item.id === itemId) ?? -1;

    if (itemIndex === -1 || !siblingItems) {
        return [];
    }

    // Wraparound
    return [...siblingItems.slice(0, itemIndex).reverse(), ...siblingItems.slice(itemIndex + 1).reverse()];
};

export const getClosestFocusableSibling = <InteractiveItemData, StaticItemData>(args: {
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[];
    isItemFocusable: (item: IUiMenuItem<InteractiveItemData, StaticItemData>) => boolean;
    itemId?: string;
    direction: "forward" | "backward";
}): IUiMenuItem<InteractiveItemData, StaticItemData> | undefined => {
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

export function unwrapGroupItems<InteractiveItemData, StaticItemData>(
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[],
) {
    const result: IUiMenuItem<InteractiveItemData, StaticItemData>[] = [];

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
