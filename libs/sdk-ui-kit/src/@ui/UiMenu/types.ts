// (C) 2025 GoodData Corporation

import React from "react";
import { IDropdownBodyRenderProps } from "../../Dropdown/index.js";

/**
 * @internal
 */
export interface IUiMenuStaticItem<T> {
    type: "static";
    id?: string;
    data: T;
}

/**
 * @internal
 */
export interface IUiMenuInteractiveItem<InteractiveItemData, StaticItemData = React.ReactNode> {
    type: "interactive";
    id: string;
    stringTitle: string;
    isDisabled?: boolean;
    data: InteractiveItemData;
    subMenu?: IUiMenuItem<InteractiveItemData, StaticItemData>[];
}

/**
 * @internal
 */
export type IUiMenuItem<InteractiveItemData, StaticItemData = React.ReactNode> =
    | IUiMenuStaticItem<StaticItemData>
    | IUiMenuInteractiveItem<InteractiveItemData, StaticItemData>;

/**
 * @internal
 */
export interface UiMenuInteractiveItemProps<InteractiveItemData, StaticItemData = React.ReactNode> {
    item: IUiMenuInteractiveItem<InteractiveItemData, StaticItemData>;

    isFocused: boolean;

    onSelect: () => void;
}

/**
 * @internal
 */
export interface UiMenuStaticItemProps<T> {
    item: IUiMenuStaticItem<T>;
}

/**
 * @internal
 */
export interface UiMenuHeaderProps<InteractiveItemData, StaticItemData = React.ReactNode> {
    onBack?: () => void;
    onClose?: () => void;
    parentItem?: IUiMenuInteractiveItem<InteractiveItemData, StaticItemData>;
}

/**
 * @internal
 */
export type ControlType = "keyboard" | "mouse" | "unknown";

/**
 * @internal
 */
export interface IUiMenuContext<InteractiveItemData, StaticItemData = React.ReactNode> {
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[];
    focusedItem: IUiMenuInteractiveItem<InteractiveItemData, StaticItemData> | undefined;
    itemRefs: React.MutableRefObject<{ [id: string]: HTMLElement }>;
    onSelect: (item: IUiMenuInteractiveItem<InteractiveItemData, StaticItemData> | undefined) => void;
    onClose?: () => void;
    setFocusedId: React.Dispatch<React.SetStateAction<string | undefined>>;
    isItemFocusable: (item: IUiMenuItem<InteractiveItemData, StaticItemData>) => boolean;
}

/**
 * @internal
 */
export interface UiMenuProps<InteractiveItemData, StaticItemData = React.ReactNode> {
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[];

    className?: string;
    itemClassName?: ((item: IUiMenuItem<InteractiveItemData, StaticItemData>) => string | undefined) | string;
    maxWidth?: number;

    onSelect?: (item: IUiMenuInteractiveItem<InteractiveItemData, StaticItemData>) => void;
    onClose?: () => void;
    onUnhandledKeyDown?: (
        event: React.KeyboardEvent,
        context: IUiMenuContext<InteractiveItemData, StaticItemData>,
    ) => void;

    InteractiveItemComponent?: React.ComponentType<
        UiMenuInteractiveItemProps<InteractiveItemData, StaticItemData>
    >;
    StaticItemComponent?: React.ComponentType<UiMenuStaticItemProps<StaticItemData>>;
    MenuHeaderComponent?: React.ComponentType<UiMenuHeaderProps<InteractiveItemData, StaticItemData>>;

    shouldKeyboardActionPreventDefault?: boolean;
    shouldKeyboardActionStopPropagation?: boolean;
    shouldCloseOnSelect?: boolean;
    isDisabledFocusable?: boolean;

    ariaAttributes: Omit<IDropdownBodyRenderProps["ariaAttributes"], "role">;
}
