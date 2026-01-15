// (C) 2025-2026 GoodData Corporation

import {
    type ComponentType,
    type Dispatch,
    type KeyboardEvent,
    type MouseEvent,
    type MutableRefObject,
    type ReactNode,
    type RefObject,
    type SetStateAction,
} from "react";

import { type IDropdownBodyRenderProps } from "../../Dropdown/index.js";
import { type IconType } from "../@types/icon.js";

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
export type IUiListboxItem<InteractiveItemData, StaticItemData = ReactNode> =
    | IUiListboxStaticItem<StaticItemData>
    | IUiListboxInteractiveItem<InteractiveItemData>;

/**
 * @internal
 */
export interface IUiListboxInteractiveItemProps<T> {
    item: IUiListboxInteractiveItem<T>;

    isFocused: boolean;
    isSelected: boolean;
    isCompact: boolean;

    onSelect: (e: MouseEvent) => void;
}

/**
 * @internal
 */
export interface IUiListboxStaticItemProps<T> {
    item: IUiListboxStaticItem<T>;
}

/**
 * @internal
 */
export interface IUiListboxContext<InteractiveItemData, StaticItemData = ReactNode> {
    items: IUiListboxItem<InteractiveItemData, StaticItemData>[];
    itemRefs: MutableRefObject<(HTMLLIElement | null)[]>;
    onSelect: (
        item: IUiListboxInteractiveItem<InteractiveItemData>,
        mods: { newTab?: boolean; type?: "mouse" | "keyboard" },
    ) => void;
    onClose?: () => void;
    selectedItemId: string | undefined;
    focusedIndex: number | undefined;
    setFocusedIndex: Dispatch<SetStateAction<number | undefined>>;
    isItemFocusable: (item: IUiListboxItem<InteractiveItemData, StaticItemData>) => boolean;
}

/**
 * @internal
 */
export type UiListboxAriaAttributes = Omit<IDropdownBodyRenderProps["ariaAttributes"], "role"> & {
    "aria-controls"?: string;
};

/**
 * @internal
 */
export interface IUiListboxProps<InteractiveItemData, StaticItemData = ReactNode> {
    items: IUiListboxItem<InteractiveItemData, StaticItemData>[];

    dataTestId?: string;
    itemDataTestId?:
        | string
        | ((item: IUiListboxItem<InteractiveItemData, StaticItemData>) => string | undefined);

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
        event: KeyboardEvent,
        context: IUiListboxContext<InteractiveItemData, StaticItemData>,
    ) => void;

    selectedItemId?: string;

    InteractiveItemComponent?: ComponentType<IUiListboxInteractiveItemProps<InteractiveItemData>>;
    StaticItemComponent?: ComponentType<IUiListboxStaticItemProps<StaticItemData>>;

    shouldKeyboardActionPreventDefault?: boolean;
    shouldKeyboardActionStopPropagation?: boolean;
    shouldCloseOnSelect?: boolean;
    isDisabledFocusable?: boolean;
    isCompact?: boolean;

    ariaAttributes: UiListboxAriaAttributes;

    reference?: RefObject<HTMLUListElement | null>;
}
