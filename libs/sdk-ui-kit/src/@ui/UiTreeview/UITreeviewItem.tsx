// (C) 2025 GoodData Corporation

import React, { useCallback } from "react";

import { e } from "./treeviewBem.js";
import type { UiStaticTreeView, LevelTypesUnion, IUiTreeviewItemProps } from "./types.js";
import { itemsState } from "./utils.js";

/**
 * @internal
 */
interface UITreeviewItemProps<Levels extends [], Level> {
    path: number[];
    item: UiStaticTreeView<Level | LevelTypesUnion<Levels>>;
    getState: ReturnType<typeof itemsState>;
    focusedItem?: UiStaticTreeView<Level>;
    selectedItemId?: string;
    itemDataTestId?: string;
    isCompact?: boolean;
    onSelect: (
        event: React.MouseEvent | React.KeyboardEvent,
        path: number[],
        item: UiStaticTreeView<Level | LevelTypesUnion<Levels>>,
    ) => void;
    onHover: (path: number[]) => void;
    ItemComponent: React.ComponentType<IUiTreeviewItemProps<Level | LevelTypesUnion<Levels>>>;
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
    } = props;

    const [state, setState] = getState(props.path);
    const { item, children } = props.item;

    const childCount = children?.length ?? 0;
    const level = props.path.length;

    const isFocused = item === focusedItem.item;
    const isSelected = item.id === selectedItemId;
    const isExpanded = state.expanded;

    const handleToggle = useCallback(
        (event: React.MouseEvent | React.KeyboardEvent, expanded: boolean) => {
            setState({
                ...state,
                expanded,
            });
            event.stopPropagation();
            event.preventDefault();
        },
        [setState, state],
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
                role="treeitem"
                aria-level={level}
                aria-expanded={isExpanded}
                aria-selected={isFocused}
                aria-disabled={item.isDisabled}
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
                    defaultStyle={defineVariables(level)}
                    defaultClassName={e("item", {
                        isFocused,
                        isSelected,
                        isCompact,
                        isExpanded,
                        isDisabled: !!item.isDisabled,
                    })}
                />
            </div>
            {children?.length && isExpanded ? (
                <div role="group" className={e("treeitem__children")}>
                    {children.map((child, i) => (
                        <UITreeviewItem
                            ItemComponent={ItemComponent}
                            onSelect={onSelect}
                            onHover={onHover}
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
}

function defineVariables(level: number) {
    return { "--ui-treeview-item-level": level } as React.CSSProperties;
}
