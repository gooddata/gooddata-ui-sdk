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

        if (item.type === "interactive" && item.subMenu) {
            const foundItemInSubMenu = findItem(item.subMenu, predicate);

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

export const getItemsByParent = <InteractiveItemData, StaticItemData>(
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[],
    parentId?: string,
): IUiMenuItem<InteractiveItemData, StaticItemData>[] | undefined => {
    const isRootLevel = parentId === undefined;

    return isRootLevel ? items : findInteractiveItem(items, (item) => item.id === parentId)?.subMenu;
};

export const getItemParent = <InteractiveItemData, StaticItemData>(
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[],
    itemId: string,
): IUiMenuInteractiveItem<InteractiveItemData, StaticItemData> | undefined => {
    return findInteractiveItem(
        items,
        (item) => !!item.subMenu?.some((subMenuItem) => subMenuItem.id === itemId),
    );
};

export const getSiblingItems = <InteractiveItemData, StaticItemData>(
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[],
    itemId: string,
): IUiMenuItem<InteractiveItemData, StaticItemData>[] | undefined => {
    // If itemId is provided but the item doesn't exist, return undefined
    if (!getItem(items, itemId)) {
        return undefined;
    }

    return getItemsByParent(items, getItemParent(items, itemId)?.id);
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

    switch (direction) {
        case "forward":
            if (itemId === undefined) {
                return items.find(isItemFocusable);
            }
            return getNextSiblings(items, itemId).find(isItemFocusable);
        case "backward":
            if (itemId === undefined) {
                return [...items].reverse().find(isItemFocusable);
            }
            return getPreviousSiblings(items, itemId).find(isItemFocusable);
    }
};
