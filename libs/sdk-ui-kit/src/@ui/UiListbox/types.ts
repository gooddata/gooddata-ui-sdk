// (C) 2025 GoodData Corporation

import React from "react";
import { IDropdownBodyRenderProps } from "../../Dropdown/index.js";

/**
 * @internal
 */
export interface IUiListboxItem<T> {
    id: string;
    stringTitle: string;
    isDisabled?: boolean;
    data: T;
}

/**
 * @internal
 */
export interface UiListboxItemProps<T> {
    item: IUiListboxItem<T>;

    isFocused: boolean;
    isSelected: boolean;

    onSelect: () => void;
}

/**
 * @internal
 */
export interface IListboxContext<T> {
    items: IUiListboxItem<T>[];
    itemRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
    onSelect: (item: IUiListboxItem<T>) => void;
    onClose?: () => void;
    selectedItemId?: string;
    focusedIndex: number;
    setFocusedIndex: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * @internal
 */
export interface UiListboxProps<T> {
    items: IUiListboxItem<T>[];

    className?: string;
    maxWidth?: number;

    onSelect?: (item: IUiListboxItem<T>) => void;
    onClose?: () => void;
    onUnhandledKeyDown?: (event: React.KeyboardEvent, context: IListboxContext<T>) => void;

    selectedItemId?: string;

    ItemComponent?: React.ComponentType<UiListboxItemProps<any>>;

    shouldKeyboardActionPreventDefault?: boolean;
    shouldKeyboardActionStopPropagation?: boolean;

    ariaAttributes: IDropdownBodyRenderProps["ariaAttributes"];
}
