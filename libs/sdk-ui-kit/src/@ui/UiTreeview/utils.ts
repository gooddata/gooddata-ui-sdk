// (C) 2025 GoodData Corporation

import type { UiRefsTree, UiStateTreeItem, UiStaticTreeView } from "./types.js";

/**
 * @internal
 **/
export function makeItemId(treeviewId: string, item?: UiStaticTreeView<unknown>) {
    return item ? `item-${treeviewId}-${item.item.id}` : undefined;
}

/**
 * @internal
 **/
export function getItemOnFocusedPath<T>(
    items: UiStaticTreeView<T>[],
    focusedPath: number[],
): UiStaticTreeView<T> | undefined {
    let currentLevel: UiStaticTreeView<T>[] = items;
    let currentItem: UiStaticTreeView<T> | undefined = undefined;

    for (let i = 0; i < focusedPath.length; i++) {
        const index = focusedPath[i];
        if (index < currentLevel.length) {
            currentItem = currentLevel[index];
            currentLevel = currentItem.children;
        }
    }

    return currentItem;
}

/**
 * @internal
 **/
export function getRefOnFocusedPath(items: UiRefsTree[], focusedPath: number[]): UiRefsTree | undefined {
    let currentLevel: UiRefsTree[] = items;
    let currentItem: UiRefsTree | undefined = undefined;

    for (let i = 0; i < focusedPath.length; i++) {
        const index = focusedPath[i];
        if (index < currentLevel.length) {
            currentItem = currentLevel[index];
            currentLevel = currentItem.children;
        }
    }

    return currentItem;
}

type ItemsState = [
    Record<string, UiStateTreeItem> | undefined,
    React.Dispatch<React.SetStateAction<Record<string, UiStateTreeItem> | undefined>>,
];

type GetItemState = (path: number[]) => [UiStateTreeItem | undefined, (item: UiStateTreeItem) => void];

/**
 * @internal
 **/
export function itemsState(state: ItemsState, defaultItem: UiStateTreeItem): GetItemState {
    return (path: number[]) => {
        // Setter
        const setter = (item: UiStateTreeItem) => {
            state[1]((st) => {
                return setItemAtPath(st, path, item, defaultItem);
            });
        };
        // Getter
        const getter = () => {
            return getItemAtPath(state[0], path, defaultItem);
        };

        return [getter(), setter];
    };
}

function getItemAtPath(
    state: Record<string, UiStateTreeItem>,
    path: number[],
    defaultItem: UiStateTreeItem,
): UiStateTreeItem {
    const key = convertPathToKey(path);
    let current: UiStateTreeItem | undefined = state[key];
    if (!current) {
        current = { ...defaultItem };
        state[key] = current;
    }
    return current;
}

function setItemAtPath(
    state: Record<string, UiStateTreeItem>,
    path: number[],
    newItem: UiStateTreeItem,
    defaultItem: UiStateTreeItem,
): Record<string, UiStateTreeItem> {
    const key = convertPathToKey(path);
    return {
        ...state,
        [key]: {
            ...defaultItem,
            ...state[key],
            ...newItem,
        },
    };
}

/**
 * @internal
 **/
export function findPath<T>(
    items: UiStaticTreeView<T>[],
    id: string | undefined,
    isFocusableItem: (item?: UiStaticTreeView<T>) => boolean,
): number[] | undefined {
    for (let i = 0; i < items.length; i++) {
        if (!id && isFocusableItem(items[i])) {
            return [i];
        }
        if (items[i].item.id === id && isFocusableItem(items[i])) {
            return [i];
        }
        const children = items[i].children;
        if (!children) {
            return [i];
        }
        const childPath = findPath(children, id, isFocusableItem);
        if (childPath) {
            return [i, ...childPath];
        }
    }
    return undefined;
}

export function getPrevPathIndex<T>(
    items: UiStaticTreeView<T>[],
    getState: ReturnType<typeof itemsState>,
    path: number[],
    isFocusableItem: (item?: UiStaticTreeView<T>) => boolean,
): number[] {
    const map = getItemsPathEntries<T>(items, getState);
    const currentKey = convertPathToKey(path);

    let currentIndex = map.findIndex(([key]) => key === currentKey);
    // Index not found
    if (currentIndex <= 0) {
        return convertKeyToPath(map[0][0]);
    }

    // Previous item index
    currentIndex--;

    let prevItem = map[currentIndex];
    while (prevItem) {
        const [key, item, expanded] = prevItem;
        if (isFocusableItem(item) && expanded) {
            return convertKeyToPath(key);
        }
        currentIndex--;
        prevItem = map[currentIndex];
    }

    return convertKeyToPath(map[0][0]);
}

export function getNextPathIndex<T>(
    items: UiStaticTreeView<T>[],
    getState: ReturnType<typeof itemsState>,
    path: number[],
    isFocusableItem: (item?: UiStaticTreeView<T>) => boolean,
): number[] {
    const map = getItemsPathEntries<T>(items, getState);
    const currentKey = convertPathToKey(path);

    let currentIndex = map.findIndex(([key]) => key === currentKey);
    // Index not found
    if (currentIndex < 0 || currentIndex >= map.length - 1) {
        return convertKeyToPath(map[map.length - 1][0]);
    }

    // Next item index
    currentIndex++;

    let nextItem = map[currentIndex];
    while (nextItem) {
        const [key, item, expanded] = nextItem;
        if (isFocusableItem(item) && expanded) {
            return convertKeyToPath(key);
        }
        currentIndex++;
        nextItem = map[currentIndex];
    }

    return convertKeyToPath(map[map.length - 1][0]);
}

export function getParentPathIndex<T>(
    items: UiStaticTreeView<T>[],
    getState: ReturnType<typeof itemsState>,
    path: number[],
    isFocusableItem: (item?: UiStaticTreeView<T>) => boolean,
): number[] {
    const map = getItemsPathEntries<T>(items, getState);
    const currentKey = convertPathToKey(path);

    let currentIndex = map.findIndex(([key]) => key === currentKey);
    // Index not found
    if (currentIndex <= 0) {
        return path;
    }

    // Parent item index
    const parentPath = path.slice(0, path.length - 1);
    const parentKey = convertPathToKey(parentPath);
    currentIndex = map.findIndex(([key]) => key === parentKey);
    // Index not found
    if (currentIndex < 0) {
        return path;
    }

    let parentItem = map[currentIndex];
    while (parentItem && !isFocusableItem(parentItem[1])) {
        currentIndex--;
        parentItem = map[currentIndex];
    }

    return convertKeyToPath(parentItem[0]);
}

function getItemsPathEntries<T = unknown>(
    items: UiStaticTreeView<T>[],
    getState: ReturnType<typeof itemsState>,
    path: number[] = [],
    expanded = true,
) {
    const entries: [string, UiStaticTreeView<T>, boolean][] = [];

    for (let i = 0; i < items.length; i++) {
        const itemPath = [...path, i];
        const item = items[i];
        const [state] = getState(itemPath);

        entries.push([convertPathToKey(itemPath), item, expanded]);
        entries.push(
            ...getItemsPathEntries(item.children ?? [], getState, itemPath, expanded && state.expanded),
        );
    }

    return entries;
}

function convertPathToKey(path: number[]): string {
    return path.join("-");
}

function convertKeyToPath(key: string): number[] {
    return key.split("-").map((s) => parseInt(s, 10));
}
