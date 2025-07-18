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
import {
    findPath,
    getItemOnFocusedPath,
    getRefOnFocusedPath,
    getParentPathIndex,
    getNextPathIndex,
    getPrevPathIndex,
    itemsState,
    makeItemId,
} from "./utils.js";

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
