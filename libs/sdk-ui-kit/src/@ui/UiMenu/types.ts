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
    subItems?: IUiMenuItem<InteractiveItemData, StaticItemData>[];
}

/**
 * @internal
 */
export interface IUiMenuGroupItem<InteractiveItemData, StaticItemData = React.ReactNode> {
    type: "group";
    id: string;
    stringTitle: string;
    data: StaticItemData;
    subItems: IUiMenuItem<InteractiveItemData, StaticItemData>[];
}

/**
 * @internal
 */
export type IUiMenuItem<InteractiveItemData, StaticItemData = React.ReactNode> =
    | IUiMenuStaticItem<StaticItemData>
    | IUiMenuInteractiveItem<InteractiveItemData, StaticItemData>
    | IUiMenuGroupItem<InteractiveItemData, StaticItemData>;

/**
 * @internal
 */
export interface UiMenuItemProps<InteractiveItemData, StaticItemData = React.ReactNode> {
    item: IUiMenuItem<InteractiveItemData, StaticItemData>;
}

/**
 * @internal
 */
export interface UiMenuInteractiveItemWrapperProps<InteractiveItemData, StaticItemData = React.ReactNode> {
    item: IUiMenuInteractiveItem<InteractiveItemData, StaticItemData>;
}

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
export interface UiMenuGroupItemProps<InteractiveItemData, StaticItemData = React.ReactNode> {
    item: IUiMenuGroupItem<InteractiveItemData, StaticItemData>;
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
export type IUiMenuControlType = "keyboard" | "mouse" | "unknown";

/**
 * @internal
 */
export interface IUiMenuPluggableComponents<InteractiveItemData, StaticItemData = React.ReactNode> {
    InteractiveItemComponent: React.ComponentType<
        UiMenuInteractiveItemProps<InteractiveItemData, StaticItemData>
    >;
    InteractiveItemWrapperComponent: React.ComponentType<
        UiMenuInteractiveItemWrapperProps<InteractiveItemData, StaticItemData>
    >;
    GroupItemComponent: React.ComponentType<UiMenuGroupItemProps<InteractiveItemData, StaticItemData>>;
    StaticItemComponent: React.ComponentType<UiMenuStaticItemProps<StaticItemData>>;
    MenuHeaderComponent: React.ComponentType;
}

/**
 * @internal
 */
export interface IUiMenuContext<InteractiveItemData, StaticItemData = React.ReactNode>
    extends IUiMenuPluggableComponents<InteractiveItemData, StaticItemData> {
    items: IUiMenuItem<InteractiveItemData, StaticItemData>[];
    focusedItem: IUiMenuInteractiveItem<InteractiveItemData, StaticItemData> | undefined;
    onSelect: (item: IUiMenuInteractiveItem<InteractiveItemData, StaticItemData> | undefined) => void;
    onClose?: () => void;
    setFocusedId: React.Dispatch<React.SetStateAction<string | undefined>>;
    isItemFocusable: (item: IUiMenuItem<InteractiveItemData, StaticItemData>) => boolean;
    controlType: IUiMenuControlType;
    setControlType: React.Dispatch<React.SetStateAction<IUiMenuControlType>>;
    scrollToView: (element: HTMLElement | null) => void;
    makeItemId: (item: IUiMenuItem<InteractiveItemData, StaticItemData>) => string;
    itemClassName?: ((item: IUiMenuItem<InteractiveItemData, StaticItemData>) => string | undefined) | string;
    ItemComponent: React.ComponentType<UiMenuItemProps<InteractiveItemData, StaticItemData>>;
    menuComponentRef: React.RefObject<HTMLElement>;
    itemsContainerRef: React.RefObject<HTMLElement>;
}

/**
 * @internal
 */
export interface UiMenuProps<InteractiveItemData, StaticItemData = React.ReactNode>
    extends Partial<IUiMenuPluggableComponents<InteractiveItemData, StaticItemData>> {
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

    shouldKeyboardActionPreventDefault?: boolean;
    shouldKeyboardActionStopPropagation?: boolean;
    shouldCloseOnSelect?: boolean;
    isDisabledFocusable?: boolean;

    ariaAttributes: Omit<IDropdownBodyRenderProps["ariaAttributes"], "role">;
}
