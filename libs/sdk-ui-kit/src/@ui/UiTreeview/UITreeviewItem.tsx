// (C) 2025 GoodData Corporation

import React, { useCallback, useMemo } from "react";

import { e } from "./treeviewBem.js";
import type {
    IUiTreeviewItemProps,
    LevelTypesUnion,
    UiRefsTree,
    UiStaticTreeView,
    UiTreeViewItemAriaAttributes,
} from "./types.js";
import { convertPathToKey, itemsState, makeItemId } from "./utils.js";

/**
 * @internal
 */
interface UITreeviewItemProps<Levels extends [], Level> {
    treeViewId: string;
    path: number[];
    item: UiStaticTreeView<Level | LevelTypesUnion<Levels>>;
    getState: ReturnType<typeof itemsState>;
    focusedItem?: UiStaticTreeView<Level>;
    selectedItemId?: string;
    itemDataTestId?: string;
    isCompact?: boolean;
    isDisabledFocusable: boolean;
    onSelect: (
        event: React.MouseEvent | React.KeyboardEvent,
        path: number[],
        item: UiStaticTreeView<Level | LevelTypesUnion<Levels>>,
    ) => void;
    onHover: (path: number[]) => void;
    ItemComponent: React.ComponentType<IUiTreeviewItemProps<Level | LevelTypesUnion<Levels>>>;
    itemsRef: React.MutableRefObject<UiRefsTree>;
}

/**
 * @internal
 */
export function UITreeviewItem<Levels extends [], Level>(props: UITreeviewItemProps<Levels, Level>) {
    const {
        getState,
        focusedItem,
        selectedItemId,
        itemDataTestId,
        onSelect,
        onHover,
        ItemComponent,
        isCompact,
        isDisabledFocusable,
        itemsRef,
        treeViewId,
        path,
    } = props;

    const [state, { toggle }] = getState(props.path);
    const { item, children } = props.item;

    const childCount = children?.length ?? 0;
    const level = props.path.length;

    const id = makeItemId(treeViewId, path);
    const isFocused = item === focusedItem.item;
    const isSelected = item.id === selectedItemId;
    const isExpanded = childCount > 0 ? state.expanded : undefined;
    const isDisabled = !isDisabledFocusable && item.isDisabled;

    const ariaAttributes: UiTreeViewItemAriaAttributes = useMemo(
        () => ({
            id,
            role: "treeitem",
            "aria-level": level,
            "aria-expanded": isExpanded,
            "aria-selected": isFocused,
            "aria-disabled": isDisabled,
        }),
        [id, level, isExpanded, isFocused, isDisabled],
    );

    const handleToggle = useCallback(
        (event: React.MouseEvent | React.KeyboardEvent, expanded: boolean) => {
            toggle(expanded);
            event.stopPropagation();
            event.preventDefault();
        },
        [toggle],
    );
    const handleSelect = useCallback(
        (event: React.MouseEvent | React.KeyboardEvent) => {
            onSelect(event, props.path, props.item);
        },
        [props.item, props.path, onSelect],
    );
    const handleHover = useCallback(() => {
        onHover(props.path);
    }, [props.path, onHover]);

    return (
        <div className={e("treeitem")}>
            <div
                className={e("treeitem__container")}
                data-testid={itemDataTestId}
                ref={(node) => {
                    itemsRef.current[convertPathToKey(path)] = node;
                }}
            >
                <ItemComponent
                    item={item}
                    type={childCount ? "group" : "leaf"}
                    childCount={childCount}
                    isCompact={isCompact}
                    isFocused={isFocused}
                    isSelected={isSelected}
                    isExpanded={isExpanded}
                    level={level}
                    onSelect={handleSelect}
                    onToggle={handleToggle}
                    onHover={handleHover}
                    ariaAttributes={ariaAttributes}
                />
            </div>
            {children?.length && isExpanded ? (
                <div role="group" className={e("treeitem__children")}>
                    {children.map((child, i) => (
                        <UITreeviewItem
                            ItemComponent={ItemComponent}
                            itemsRef={itemsRef}
                            onSelect={onSelect}
                            onHover={onHover}
                            getState={getState}
                            focusedItem={focusedItem}
                            selectedItemId={selectedItemId}
                            itemDataTestId={itemDataTestId}
                            isCompact={isCompact}
                            isDisabledFocusable={isDisabledFocusable}
                            item={child}
                            key={i}
                            treeViewId={treeViewId}
                            path={[...props.path, i]}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
