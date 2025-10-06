// (C) 2025 GoodData Corporation

import {
    KeyboardEvent as ReactKeyboardEvent,
    MouseEvent as ReactMouseEvent,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useAutoupdateRef } from "@gooddata/sdk-ui";

import { DefaultUiTreeViewItemComponent } from "./defaults/DefaultUiTreeViewItemComponent.js";
import { b } from "./treeviewBem.js";
import {
    IUiLeveledTreeViewProps,
    IUiStaticTreeViewProps,
    IUiTreeviewContext,
    LevelTypesUnion,
    UiRefsTree,
    UiStateTreeItem,
    UiStaticTreeView,
} from "./types.js";
import { useUiTreeViewEventSubscriber } from "./UiTreeViewEvents.js";
import { UITreeviewItem } from "./UITreeviewItem.js";
import { UiTreeviewRoot } from "./UiTreeviewRoot.js";
import {
    findPath,
    getItemOnFocusedPath,
    getNextPathIndex,
    getParentPathIndex,
    getPrevPathIndex,
    getRefOnFocusedPath,
    itemsState,
    makeItemId,
} from "./utils.js";
import { makeMenuKeyboardNavigation } from "../@utils/keyboardNavigation.js";

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
    expansionMode = "multiple",

    dataTestId,
    itemDataTestId,
    width,
    maxWidth,
    maxHeight,
    onSelect,
    onFocus,
    onClose,
    onUnhandledKeyDown = () => {},

    selectedItemId,

    ItemComponent = DefaultUiTreeViewItemComponent,

    shouldKeyboardActionPreventDefault,
    shouldKeyboardActionStopPropagation,
    shouldCloseOnSelect = true,
    isDisabledFocusable = false,
    isCompact = false,
    autoFocus = true,

    ariaAttributes,
}: IUiStaticTreeViewProps<Level>): ReactNode {
    const treeViewId = ariaAttributes.id;
    const itemsRef = useRef<UiRefsTree>({});

    const getState = itemsState(
        useState<Record<string, UiStateTreeItem>>({}),
        {
            expanded: expandedMode === "default-expanded",
        },
        {
            expansionMode,
        },
    );

    const isItemFocusable = useCallback(
        (item?: UiStaticTreeView<Level> | UiStaticTreeView<LevelTypesUnion<Levels>>) => {
            if (!item) {
                return false;
            }
            return isDisabledFocusable || !item.item.isDisabled;
        },
        [isDisabledFocusable],
    );

    const [focusedPath, setFocusedPath] = useState<number[]>(() => {
        if (!autoFocus) {
            return [];
        }
        return findPath(items, selectedItemId, isItemFocusable) ?? [];
    });
    const focusedItem = getItemOnFocusedPath(items, focusedPath);
    const focusedItemNode = getRefOnFocusedPath(itemsRef.current, focusedPath);

    // Scroll focused item into view
    useEffect(() => {
        if (!focusedItemNode?.scrollIntoView) {
            return;
        }
        focusedItemNode.scrollIntoView({ block: "nearest" });
    }, [focusedItemNode]);

    // Notify parent about focus change
    useEffect(() => {
        if (!focusedPath.length) {
            onFocus?.();
            return;
        }
        onFocus?.(makeItemId(treeViewId, focusedPath));
    }, [treeViewId, focusedPath, onFocus]);

    const onSelectHandle = useCallback(
        (event: ReactMouseEvent | ReactKeyboardEvent, path: number[], item?: UiStaticTreeView<Level>) => {
            const isDisabled = !isDisabledFocusable && item?.item.isDisabled;
            if (!item || isDisabled) {
                return;
            }

            function doSelect() {
                if (event.nativeEvent instanceof KeyboardEvent) {
                    onSelect?.(
                        item.item,
                        {
                            type: "keyboard",
                            newTab: event.ctrlKey || event.metaKey,
                        },
                        event,
                    );
                } else {
                    onSelect?.(
                        item.item,
                        {
                            type: "mouse",
                            newTab: event.ctrlKey || event.metaKey || event.nativeEvent.button === 1,
                        },
                        event,
                    );
                }
                if (shouldCloseOnSelect) {
                    onClose?.();
                }
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
                    if (!item.children || item.children.length === 0) {
                        doSelect();
                        return;
                    }
                    // Toggle group is leaf-only selection mode
                    const [state, { toggle }] = getState(path);
                    toggle(!state.expanded);
                    break;
                }
            }
        },
        [getState, onClose, onSelect, selectionMode, shouldCloseOnSelect, isDisabledFocusable],
    );

    const onHoverHandle = useCallback((path: number[]) => {
        setFocusedPath(path);
    }, []);

    const contextRef = useAutoupdateRef<IUiTreeviewContext<Levels, Level>>({
        itemsRef,
        items,
        onClose,
        selectedItemId,
        onSelect: onSelectHandle,
        isItemFocusable,
        setFocusedPath,
    });

    const handleKeyDown = useMemo(
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
                            return getNextPathIndex(items, getState, [], isItemFocusable);
                        });
                    },
                    onFocusLast: () => {
                        setFocusedPath(() => {
                            return getPrevPathIndex(items, getState, [], isItemFocusable);
                        });
                    },
                    onEnterLevel: () => {
                        const [state, { toggle }] = getState(focusedPath);
                        if (!focusedItem.children?.length) {
                            return;
                        }
                        if (state.expanded) {
                            setFocusedPath((prevPath) => {
                                return getNextPathIndex(items, getState, prevPath, isItemFocusable);
                            });
                        } else {
                            toggle(true);
                        }
                    },
                    onLeaveLevel: () => {
                        const [state, { toggle }] = getState(focusedPath);
                        if (!focusedItem.children?.length || !state.expanded) {
                            setFocusedPath((prevPath) => {
                                return getParentPathIndex(items, getState, prevPath, isItemFocusable);
                            });
                        } else {
                            toggle(false);
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

    // Handle outside keyboard events in the same way as internal keyboard events
    useUiTreeViewEventSubscriber("keydown", handleKeyDown);

    return (
        <div className={b()} style={{ width, maxWidth, maxHeight }} data-testid={dataTestId}>
            <UiTreeviewRoot handleKeyDown={handleKeyDown} ariaAttributes={ariaAttributes} path={focusedPath}>
                {items.map((item, index) => (
                    <UITreeviewItem
                        ItemComponent={ItemComponent}
                        itemsRef={itemsRef}
                        onSelect={onSelectHandle}
                        onHover={onHoverHandle}
                        getState={getState}
                        focusedItem={focusedItem}
                        selectedItemId={selectedItemId}
                        itemDataTestId={itemDataTestId}
                        isCompact={isCompact}
                        isDisabledFocusable={isDisabledFocusable}
                        item={item}
                        key={index}
                        treeViewId={treeViewId}
                        path={[index]}
                    />
                ))}
            </UiTreeviewRoot>
        </div>
    );
}
