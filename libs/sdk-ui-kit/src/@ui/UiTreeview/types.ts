// (C) 2025 GoodData Corporation
import type React from "react";

import type { IconType } from "../@types/icon.js";

/**
 * @internal
 */
export type UiTreeViewNode<Levels extends unknown[], Depth extends number = 0> = Levels extends [
    infer Current,
    ...infer Rest,
]
    ? {
          item: IUiTreeViewItem<Current>;
          children?: UiTreeViewNode<Rest, UiTreeViewAddLevel<Depth>>[];
      }
    : never;

/**
 * @internal
 */
export type UiTreeViewAddLevel<N extends number> = [...Array<N>, unknown]["length"];

/**
 * @internal
 */
export type UiTreeViewTree<T> = {
    item: IUiTreeViewItem<T>;
    children?: UiTreeViewTree<T>[];
};

/**
 * @internal
 */
export type LevelTypesUnion<Levels extends unknown[]> = Levels[number];

/**
 * @internal
 */
export type UiLeveledTreeView<Levels extends unknown[]> = UiTreeViewNode<Levels>;
/**
 * @internal
 */
export type UiStaticTreeView<Level> = UiTreeViewTree<Level>;

/**
 * @internal
 */
export interface IUiTreeViewItem<T> {
    id: string;
    stringTitle: string;
    data: T;
    url?: string;
    icon?: IconType;
    isDisabled?: boolean;
    tooltip?: string;
}

/**
 * @internal
 */
export interface IUiStaticTreeViewProps<Level> extends IUiTreeViewProps<unknown[], Level> {
    items: UiStaticTreeView<Level>[];
    onSelect?: OnStaticSelectFn<Level>;
    ItemComponent?: React.ComponentType<IUiTreeviewItemProps<Level>>;
}

/**
 * @internal
 */
export type OnStaticSelectFn<Level> = (
    item: IUiTreeViewItem<Level>,
    mods: IUiTreeViewSelectionMods,
    event: React.MouseEvent | React.KeyboardEvent,
) => void;

/**
 * @internal
 */
export interface IUiLeveledTreeViewProps<Levels extends any[]> extends IUiTreeViewProps<Levels, undefined> {
    items: UiLeveledTreeView<Levels>[];
    onSelect?: OnLeveledSelectFn<Levels>;
    ItemComponent?: React.ComponentType<IUiTreeviewItemProps<LevelTypesUnion<Levels>>>;
}
/**
 * @internal
 */
export type OnLeveledSelectFn<Levels extends any[]> = (
    item: IUiTreeViewItem<LevelTypesUnion<Levels>>,
    mods: IUiTreeViewSelectionMods,
    event: React.MouseEvent | React.KeyboardEvent,
) => void;

/**
 * @internal
 */
export interface IUiTreeViewSelectionMods {
    type?: "mouse" | "keyboard";
    newTab?: boolean;
}

/**
 * @internal
 */
export interface IUiTreeViewProps<Levels extends any[], Level> {
    dataTestId?: string;
    itemDataTestId?: string;
    width?: number;
    maxWidth?: number;
    maxHeight?: number;
    selectionMode?: "groups-and-leafs" | "groups-only" | "leafs-only";
    expandedMode?: "default-expanded" | "default-collapsed";
    expansionMode?: "multiple" | "single";

    onFocus?: (nodeId: string) => void;
    onClose?: () => void;
    onUnhandledKeyDown?: (event: React.KeyboardEvent, context: IUiTreeviewContext<Levels, Level>) => void;

    selectedItemId?: string;

    shouldKeyboardActionPreventDefault?: boolean;
    shouldKeyboardActionStopPropagation?: boolean;
    shouldCloseOnSelect?: boolean;
    isDisabledFocusable?: boolean;
    isCompact?: boolean;

    ariaAttributes: UiTreeViewAriaAttributes;
}

/**
 * @internal
 */
export interface IUiTreeviewContext<Levels extends any[], Level> {
    items: UiLeveledTreeView<LevelTypesUnion<Levels>>[] | UiStaticTreeView<Level>[];
    itemsRef: React.MutableRefObject<UiRefsTree>;
    onClose: () => void;
    onSelect: (
        event: React.MouseEvent | React.KeyboardEvent,
        path: number[],
        item?: UiStaticTreeView<Level | LevelTypesUnion<Levels>>,
    ) => void;
    isItemFocusable: (item?: UiStaticTreeView<Level> | UiStaticTreeView<LevelTypesUnion<Levels>>) => boolean;
    setFocusedPath: React.Dispatch<React.SetStateAction<number[] | undefined>>;
    selectedItemId: string | undefined;
}

/**
 * @internal
 */
export interface IUiTreeviewItemProps<T> {
    type: "leaf" | "group";
    childCount: number;
    item: IUiTreeViewItem<T>;

    isFocused: boolean;
    isExpanded: boolean;
    isSelected: boolean;
    isCompact: boolean;
    level: number;
    ariaAttributes: UiTreeViewItemAriaAttributes;

    onSelect: (e: React.MouseEvent | React.KeyboardEvent) => void;
    onToggle: (e: React.MouseEvent | React.KeyboardEvent, state: boolean) => void;
    onHover: (e: React.MouseEvent) => void;
}

/**
 * @internal
 */
export type UiTreeViewAriaAttributes = Pick<React.AriaAttributes, "aria-label" | "aria-labelledby"> & {
    id: string;
    tabIndex?: number;
};

/**
 * @internal
 */
export type UiTreeViewItemAriaAttributes = Pick<
    React.AriaAttributes,
    "aria-level" | "aria-expanded" | "aria-selected" | "aria-disabled"
> & {
    id: string;
    role: "treeitem";
};

/**
 * @internal
 */
export type UiRefsTree = Record<string, HTMLDivElement | null>;
/**
 * @internal
 */
export type UiStateTreeItem = {
    expanded: boolean;
};
