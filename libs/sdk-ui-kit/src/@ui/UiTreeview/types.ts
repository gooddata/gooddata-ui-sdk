// (C) 2025 GoodData Corporation
import { IconType } from "../@types/icon.js";
import { IDropdownBodyRenderProps } from "../../Dropdown/index.js";
import React from "react";

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
    item: Level,
    mods: {
        type?: "mouse" | "keyboard";
        newTab?: boolean;
    },
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
    item: LevelTypesUnion<Levels>,
    mods: {
        type?: "mouse" | "keyboard";
        newTab?: boolean;
    },
) => void;

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

    onClose?: () => void;
    onUnhandledKeyDown?: (event: React.KeyboardEvent, context: IUiTreeviewContext<Levels, Level>) => void;

    selectedItemId?: string;

    shouldKeyboardActionPreventDefault?: boolean;
    shouldKeyboardActionStopPropagation?: boolean;
    shouldCloseOnSelect?: boolean;
    isDisabledFocusable?: boolean;
    isCompact?: boolean;

    ariaAttributes: UiTreeviewAriaAttributes;
}

/**
 * @internal
 */
export interface IUiTreeviewContext<Levels extends any[], Level> {
    items: UiLeveledTreeView<LevelTypesUnion<Levels>>[] | UiStaticTreeView<Level>[];
    itemsRef: React.MutableRefObject<UiRefsTree[]>;
    onClose: () => void;
    onSelect: (
        e: React.MouseEvent | React.KeyboardEvent,
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
    item: IUiTreeViewItem<T>;
    defaultClassName: string;
    defaultStyle: React.CSSProperties;

    isFocused: boolean;
    isExpanded: boolean;
    isSelected: boolean;
    isCompact: boolean;
    level: number;

    onSelect: (e: React.MouseEvent | React.KeyboardEvent) => void;
    onToggle: (e: React.MouseEvent | React.KeyboardEvent, state: boolean) => void;
}

/**
 * @internal
 */
export type UiTreeviewAriaAttributes = Omit<IDropdownBodyRenderProps["ariaAttributes"], "role">;

/**
 * @internal
 */
export type UiRefsTree = {
    item: HTMLLIElement;
    children?: UiRefsTree[];
};
/**
 * @internal
 */
export type UiStateTreeItem = {
    expanded: boolean;
};
