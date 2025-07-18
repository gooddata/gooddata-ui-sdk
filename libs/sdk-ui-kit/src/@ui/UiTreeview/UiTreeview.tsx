// (C) 2025 GoodData Corporation

import React, { useCallback } from "react";
import noop from "lodash/noop.js";
import { useAutoupdateRef } from "@gooddata/sdk-ui";

import { makeMenuKeyboardNavigation } from "../@utils/keyboardNavigation.js";

import { DefaultUiTreeViewItemComponent } from "./defaults/DefaultUiTreeViewItemComponent.js";
import { b, e } from "./treeviewBem.js";
import {
    IUiLeveledTreeViewProps,
    IUiStaticTreeViewProps,
    IUiTreeviewContext,
    IUiTreeviewItemProps,
    LevelTypesUnion,
    UiRefsTree,
    UiStateTreeItem,
    UiStaticTreeView,
    UiTreeviewAriaAttributes,
} from "./types.js";

/**
 * An accessible treeview component with static data that can be navigated by keyboard.
 * This is component for tree where all items are same type.
 * Usable in a <Dropdown /> component.
 * Should implement https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
 *
 * @internal
 */
export function UiStaticTreeview<Level>(props: IUiStaticTreeViewProps<Level>) {
    return <UiTreeview<[], Level> {...props} />;
}

/**
 * An accessible treeview component with static data that can be navigated by keyboard.
 * This is component for tree where on each level items have different types.
 * Usable in a <Dropdown /> component.
 * Should implement https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
 *
 * @internal
 */
export function UiLeveledTreeview<Levels extends unknown[]>(props: IUiLeveledTreeViewProps<Levels>) {
    return <UiTreeview<Levels, unknown> {...props} />;
}

function UiTreeview<Levels extends unknown[], Level>({
    items,
    selectionMode = "groups-and-leafs",
    expandedMode = "default-expanded",

    dataTestId,
    itemDataTestId,
    width,
    maxWidth,
    maxHeight,
    onSelect,
    onClose,
    onUnhandledKeyDown = noop,

    selectedItemId,

    ItemComponent = DefaultUiTreeViewItemComponent,

    shouldKeyboardActionPreventDefault,
    shouldKeyboardActionStopPropagation,
    shouldCloseOnSelect = true,
    isDisabledFocusable = false,
    isCompact = false,

    ariaAttributes,
}: IUiStaticTreeViewProps<Level>): React.ReactNode {
    const itemsRef = React.useRef<UiRefsTree[]>([]);
    const getState = itemsState(React.useState<Record<string, UiStateTreeItem>>({}), {
        expanded: expandedMode === "default-expanded",
    });

    const isItemFocusable = React.useCallback(
        (item?: UiStaticTreeView<Level> | UiStaticTreeView<LevelTypesUnion<Levels>>) => {
            if (!item) {
                return false;
            }
            return isDisabledFocusable || !item.item.isDisabled;
        },
        [isDisabledFocusable],
    );

    const [focusedPath, setFocusedPath] = React.useState<number[]>(() =>
        findPath(items, selectedItemId, isItemFocusable),
    );

    const focusedItem = getItemOnFocusedPath(items, focusedPath);
    // Scroll focused item into view
    const focusedItemNode = getRefOnFocusedPath(itemsRef.current, focusedPath);
    React.useEffect(() => {
        focusedItemNode?.item.scrollIntoView({ block: "nearest" });
    }, [focusedItemNode]);

    const onSelectHandle = useCallback(
        (e: React.MouseEvent | React.KeyboardEvent, path: number[], item?: UiStaticTreeView<Level>) => {
            if (!item || item.item.isDisabled) {
                return;
            }

            function doSelect() {
                if (e.nativeEvent instanceof KeyboardEvent) {
                    onSelect?.(item.item.data, {
                        type: "keyboard",
                        newTab: e.ctrlKey || e.metaKey,
                    });
                } else {
                    onSelect?.(item.item.data, {
                        type: "mouse",
                        newTab: e.ctrlKey || e.metaKey || e.nativeEvent.button === 1,
                    });
                }
                shouldCloseOnSelect && onClose?.();
            }

            switch (selectionMode) {
                case "groups-and-leafs":
                    doSelect();
                    break;
                case "groups-only":
                    // Group has children even if there are empty
                    if (item.children) {
                        doSelect();
                    }
                    break;
                case "leafs-only": {
                    // Leaf has no children
                    if (!item.children) {
                        doSelect();
                        return;
                    }
                    // Toggle group is leaf-only selection mode
                    const [state, setState] = getState(path);
                    setState({
                        ...state,
                        expanded: !state.expanded,
                    });
                    break;
                }
            }
        },
        [getState, onClose, onSelect, selectionMode, shouldCloseOnSelect],
    );

    const contextRef = useAutoupdateRef<IUiTreeviewContext<Levels, Level>>({
        itemsRef,
        items,
        onClose,
        selectedItemId,
        onSelect: onSelectHandle,
        isItemFocusable,
        setFocusedPath,
    });

    const handleKeyDown = React.useMemo(
        () =>
            makeMenuKeyboardNavigation(
                {
                    onFocusPrevious: () => {
                        setFocusedPath((prevPath) => {
                            return getPrevPathIndex(items, getState, prevPath, isItemFocusable);
                        });
                    },
                    onFocusNext: () => {
                        setFocusedPath((prevPath) => {
                            return getNextPathIndex(items, getState, prevPath, isItemFocusable);
                        });
                    },
                    onFocusFirst: () => {
                        setFocusedPath(() => {
                            return getPrevPathIndex(items, getState, [], isItemFocusable);
                        });
                    },
                    onFocusLast: () => {
                        setFocusedPath(() => {
                            return getNextPathIndex(items, getState, [], isItemFocusable);
                        });
                    },
                    onEnterLevel: () => {
                        const [state, setState] = getState(focusedPath);
                        if (!focusedItem.children?.length) {
                            return;
                        }
                        if (state.expanded) {
                            setFocusedPath((prevPath) => {
                                return getNextPathIndex(items, getState, prevPath, isItemFocusable);
                            });
                        } else {
                            setState({
                                ...state,
                                expanded: true,
                            });
                        }
                    },
                    onLeaveLevel: () => {
                        const [state, setState] = getState(focusedPath);
                        if (!focusedItem.children?.length || !state.expanded) {
                            setFocusedPath((prevPath) => {
                                return getParentPathIndex(items, getState, prevPath, isItemFocusable);
                            });
                        } else {
                            setState({
                                ...state,
                                expanded: false,
                            });
                        }
                    },
                    onSelect: (e) => {
                        if (focusedItem) {
                            onSelectHandle(e, focusedPath, focusedItem);
                        }
                    },
                    onClose,
                    onUnhandledKeyDown: (event) => {
                        onUnhandledKeyDown(event, contextRef.current);
                    },
                },
                {
                    shouldPreventDefault: shouldKeyboardActionPreventDefault,
                    shouldStopPropagation: shouldKeyboardActionStopPropagation,
                },
            ),
        [
            contextRef,
            focusedItem,
            focusedPath,
            getState,
            isItemFocusable,
            items,
            onClose,
            onSelectHandle,
            onUnhandledKeyDown,
            shouldKeyboardActionPreventDefault,
            shouldKeyboardActionStopPropagation,
        ],
    );

    return (
        <div className={b()} style={{ width, maxWidth, maxHeight }} data-testid={dataTestId}>
            <TreeRootComponent
                handleKeyDown={handleKeyDown}
                ariaAttributes={ariaAttributes}
                focusedItem={focusedItem}
            >
                {items.map((item, index) => (
                    <TreeItemComponent
                        ItemComponent={ItemComponent}
                        onSelectHandle={onSelectHandle}
                        getState={getState}
                        focusedItem={focusedItem}
                        selectedItemId={selectedItemId}
                        itemDataTestId={itemDataTestId}
                        isCompact={isCompact}
                        item={item}
                        key={index}
                        path={[index]}
                    />
                ))}
            </TreeRootComponent>
        </div>
    );
}

// Root component renders the treeview.

interface TreeRootComponentProps {
    children?: React.ReactNode;
    focusedItem?: UiStaticTreeView<unknown>;
    handleKeyDown: (event: React.KeyboardEvent) => void;
    ariaAttributes: UiTreeviewAriaAttributes;
}
const TreeRootComponent = (props: TreeRootComponentProps) => {
    const { handleKeyDown, children, ariaAttributes, focusedItem } = props;
    return (
        <div
            className={e("root")}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            role="tree"
            aria-activedescendant={makeItemId(ariaAttributes.id, focusedItem)}
            {...ariaAttributes}
        >
            {children}
        </div>
    );
};

// TreeItem component renders the treeview item.

interface TreeItemComponentProps<Levels extends [], Level> {
    path: number[];
    item: UiStaticTreeView<Level | LevelTypesUnion<Levels>>;
    getState: ReturnType<typeof itemsState>;
    focusedItem?: UiStaticTreeView<Level>;
    selectedItemId?: string;
    itemDataTestId?: string;
    isCompact?: boolean;
    onSelectHandle: (
        e: React.MouseEvent | React.KeyboardEvent,
        path: number[],
        item: UiStaticTreeView<Level | LevelTypesUnion<Levels>>,
    ) => void;
    ItemComponent: React.ComponentType<IUiTreeviewItemProps<Level | LevelTypesUnion<Levels>>>;
}
const TreeItemComponent = <Levels extends [], Level>(props: TreeItemComponentProps<Levels, Level>) => {
    const {
        getState,
        focusedItem,
        selectedItemId,
        itemDataTestId,
        onSelectHandle,
        ItemComponent,
        isCompact,
    } = props;

    const [state, setState] = getState(props.path);
    const { item, children } = props.item;

    const level = props.path.length;

    const isFocused = item === focusedItem.item;
    const isSelected = item.id === selectedItemId;
    const isExpanded = state.expanded;

    const onToggleHandle = useCallback(
        (e: React.MouseEvent | React.KeyboardEvent, expanded: boolean) => {
            setState({
                ...state,
                expanded,
            });
            e.stopPropagation();
            e.preventDefault();
        },
        [setState, state],
    );
    const onInnerSelectHandle = useCallback(
        (e: React.MouseEvent | React.KeyboardEvent) => {
            onSelectHandle(e, props.path, props.item);
        },
        [props.item, props.path, onSelectHandle],
    );

    return (
        <div className={e("treeitem")}>
            <div
                className={e("treeitem__container")}
                data-testid={itemDataTestId}
                role="treeitem"
                aria-level={level}
                aria-expanded={isExpanded ? "true" : "false"}
                aria-selected={isSelected ? "true" : "false"}
                aria-disabled={item.isDisabled ? "true" : "false"}
            >
                <ItemComponent
                    item={item}
                    type={children?.length ? "group" : "leaf"}
                    isCompact={isCompact}
                    isFocused={isFocused}
                    isSelected={isSelected}
                    isExpanded={isExpanded}
                    level={level}
                    onSelect={onInnerSelectHandle}
                    onToggle={onToggleHandle}
                    classNames={e("item", {
                        isFocused,
                        isSelected,
                        isCompact,
                        isExpanded,
                        isDisabled: !!item.isDisabled,
                    }).split(" ")}
                />
            </div>
            {children?.length && isExpanded ? (
                <div role="group" className={e("treeitem__children")}>
                    {children.map((child, i) => (
                        <TreeItemComponent
                            ItemComponent={ItemComponent}
                            onSelectHandle={onSelectHandle}
                            getState={getState}
                            focusedItem={focusedItem}
                            selectedItemId={selectedItemId}
                            itemDataTestId={itemDataTestId}
                            isCompact={isCompact}
                            item={child}
                            key={i}
                            path={[...props.path, i]}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
};

//utils

const makeItemId = (treeviewId: string, item?: UiStaticTreeView<unknown>) =>
    item ? `item-${treeviewId}-${item.item.id}` : undefined;

function getItemOnFocusedPath<T>(
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

function getRefOnFocusedPath(items: UiRefsTree[], focusedPath: number[]): UiRefsTree | undefined {
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

type CurrentState = [
    Record<string, UiStateTreeItem> | undefined,
    React.Dispatch<React.SetStateAction<Record<string, UiStateTreeItem> | undefined>>,
];

function itemsState(
    state: CurrentState,
    defaultItem: UiStateTreeItem,
): (path: number[]) => [UiStateTreeItem | undefined, (item: UiStateTreeItem) => void] {
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
    let current: UiStateTreeItem | undefined = state[path.join("-")];
    if (!current) {
        current = { ...defaultItem };
        state[path.join("-")] = current;
    }
    return current;
}

function setItemAtPath(
    state: Record<string, UiStateTreeItem>,
    path: number[],
    newItem: UiStateTreeItem,
    defaultItem: UiStateTreeItem,
): Record<string, UiStateTreeItem> {
    const key = path.join("-");
    return {
        ...state,
        [key]: {
            ...defaultItem,
            ...state[key],
            ...newItem,
        },
    };
}

function findPath<T>(
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
        const childPath = findPath(items[i].children, id, isFocusableItem);
        if (childPath) {
            return [i, ...childPath];
        }
    }
    return undefined;
}

function getPrevPathIndex<T>(
    items: UiStaticTreeView<T>[],
    getState: ReturnType<typeof itemsState>,
    path: number[],
    isFocusableItem: (item?: UiStaticTreeView<T>) => boolean,
): number[] {
    const map = getItemsPathEntries<T>(items, getState);
    const currentKey = path.join("-");

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

function getNextPathIndex<T>(
    items: UiStaticTreeView<T>[],
    getState: ReturnType<typeof itemsState>,
    path: number[],
    isFocusableItem: (item?: UiStaticTreeView<T>) => boolean,
): number[] {
    const map = getItemsPathEntries<T>(items, getState);
    const currentKey = path.join("-");

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

function getParentPathIndex<T>(
    items: UiStaticTreeView<T>[],
    getState: ReturnType<typeof itemsState>,
    path: number[],
    isFocusableItem: (item?: UiStaticTreeView<T>) => boolean,
): number[] {
    const map = getItemsPathEntries<T>(items, getState);
    const currentKey = path.join("-");

    let currentIndex = map.findIndex(([key]) => key === currentKey);
    // Index not found
    if (currentIndex <= 0) {
        return path;
    }

    // Parent item index
    const parentPath = path.slice(0, path.length - 1);
    const parentKey = parentPath.join("-");
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

        entries.push([itemPath.join("-"), item, expanded]);
        entries.push(
            ...getItemsPathEntries(item.children ?? [], getState, itemPath, expanded && state.expanded),
        );
    }

    return entries;
}

function convertKeyToPath(key: string): number[] {
    return key.split("-").map((s) => parseInt(s, 10));
}
