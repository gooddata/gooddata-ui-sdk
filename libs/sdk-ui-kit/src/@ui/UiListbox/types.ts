// (C) 2025 GoodData Corporation

import React from "react";

import { IDropdownBodyRenderProps } from "../../Dropdown/index.js";
import { IconType } from "../@types/icon.js";

/**
 * @internal
 */
export interface IUiListboxStaticItem<T> {
    type: "static";
    id?: string;
    data: T;
}

/**
 * @internal
 */
export interface IUiListboxInteractiveItem<T> {
    type: "interactive";
    id: string;
    stringTitle: string;
    icon?: IconType;
    isDisabled?: boolean;
    data: T;
    tooltip?: string;
}

/**
 * @internal
 */
export type IUiListboxItem<InteractiveItemData, StaticItemData = React.ReactNode> =
    | IUiListboxStaticItem<StaticItemData>
    | IUiListboxInteractiveItem<InteractiveItemData>;

/**
 * @internal
 */
export interface UiListboxInteractiveItemProps<T> {
    item: IUiListboxInteractiveItem<T>;

    isFocused: boolean;
    isSelected: boolean;
    isCompact: boolean;

    onSelect: (e: React.MouseEvent) => void;
}

/**
 * @internal
 */
export interface UiListboxStaticItemProps<T> {
    item: IUiListboxStaticItem<T>;
}

/**
 * @internal
 */
export interface IUiListboxContext<InteractiveItemData, StaticItemData = React.ReactNode> {
    items: IUiListboxItem<InteractiveItemData, StaticItemData>[];
    itemRefs: React.MutableRefObject<(HTMLLIElement | null)[]>;
    onSelect: (item: IUiListboxInteractiveItem<InteractiveItemData>) => void;
    onClose?: () => void;
    selectedItemId: string | undefined;
    focusedIndex: number | undefined;
    setFocusedIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
    isItemFocusable: (item: IUiListboxItem<InteractiveItemData, StaticItemData>) => boolean;
}

/**
 * @internal
 */
export type UiListboxAriaAttributes = Omit<IDropdownBodyRenderProps["ariaAttributes"], "role">;

/**
 * @internal
 */
export interface UiListboxProps<InteractiveItemData, StaticItemData = React.ReactNode> {
    items: IUiListboxItem<InteractiveItemData, StaticItemData>[];

    dataTestId?: string;
    itemDataTestId?: string;

    width?: number;
    maxWidth?: number;
    maxHeight?: number;

    onSelect?: (
        item: IUiListboxInteractiveItem<InteractiveItemData>,
        mods: {
            type?: "mouse" | "keyboard";
            newTab?: boolean;
        },
    ) => void;
    onClose?: () => void;
    onUnhandledKeyDown?: (
        event: React.KeyboardEvent,
        context: IUiListboxContext<InteractiveItemData, StaticItemData>,
    ) => void;

    selectedItemId?: string;

    InteractiveItemComponent?: React.ComponentType<UiListboxInteractiveItemProps<InteractiveItemData>>;
    StaticItemComponent?: React.ComponentType<UiListboxStaticItemProps<StaticItemData>>;

    shouldKeyboardActionPreventDefault?: boolean;
    shouldKeyboardActionStopPropagation?: boolean;
    shouldCloseOnSelect?: boolean;
    isDisabledFocusable?: boolean;
    isCompact?: boolean;

    ariaAttributes: UiListboxAriaAttributes;
}
