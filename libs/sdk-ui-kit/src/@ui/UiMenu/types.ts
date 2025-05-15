// (C) 2025 GoodData Corporation

import React from "react";
import { IDropdownBodyRenderProps } from "../../Dropdown/index.js";

/**
 * @internal
 */
export type IUiMenuItemData = { [type in IUiMenuItem<any>["type"]]?: unknown };

/**
 * @internal
 */
export type IUiMenuStaticItem<T extends IUiMenuItemData = object> = {
    type: "static";
    id?: string;
    data: T["static"];
};

/**
 * @internal
 */
export type IUiMenuInteractiveItem<T extends IUiMenuItemData = object> = {
    type: "interactive";
    id: string;
    stringTitle: string;
    isDisabled?: boolean;
    data: T["interactive"];
    subItems?: IUiMenuItem<T>[];
};

/**
 * @internal
 */
export type IUiMenuGroupItem<T extends IUiMenuItemData = object> = {
    type: "group";
    id: string;
    stringTitle: string;
    data: T["group"];
    subItems: IUiMenuItem<T>[];
};

/**
 * @internal
 */
export type IUiMenuContentItem<T extends IUiMenuItemData = object> = {
    type: "content";
    id: string;
    stringTitle: string;
    isDisabled?: boolean;
    showComponentOnly?: boolean;
    data: T["content"];
    component: React.ComponentType<{
        onBack?: () => void;
        onClose?: () => void;
        menuCtxData?: T["content"];
    }>;
};

/**
 * @internal
 */
export type IUiMenuItem<T extends IUiMenuItemData = object> =
    | IUiMenuStaticItem<T>
    | IUiMenuInteractiveItem<T>
    | IUiMenuGroupItem<T>
    | IUiMenuContentItem<T>;

/**
 * @internal
 */
export type IUiMenuFocusableItem<T extends IUiMenuItemData = object> =
    | IUiMenuInteractiveItem<T>
    | IUiMenuContentItem<T>;

/**
 * @internal
 */
export interface UiMenuItemProps<T extends IUiMenuItemData = object> {
    item: IUiMenuItem<T>;
}

/**
 * @internal
 */
export interface UiMenuInteractiveItemWrapperProps<T extends IUiMenuItemData = object> {
    item: IUiMenuInteractiveItem<T>;
}

/**
 * @internal
 */
export interface UiMenuContentItemWrapperProps<T extends IUiMenuItemData = object> {
    item: IUiMenuContentItem<T>;
}

/**
 * @internal
 */
export interface UiMenuInteractiveItemProps<T extends IUiMenuItemData = object> {
    item: IUiMenuInteractiveItem<T>;

    isFocused: boolean;

    onSelect: () => void;
}

/**
 * @internal
 */
export interface UiMenuGroupItemProps<T extends IUiMenuItemData = object> {
    item: IUiMenuGroupItem<T>;
}

/**
 * @internal
 */
export interface UiMenuStaticItemProps<T extends IUiMenuItemData = object> {
    item: IUiMenuStaticItem<T>;
}

/**
 * @internal
 */
export interface UiMenuContentItemProps<T extends IUiMenuItemData = object> {
    item: IUiMenuContentItem<T>;
    isFocused: boolean;
    onSelect: () => void;
}

/**
 * @internal
 */
export interface UiMenuContentProps<T extends IUiMenuItemData = object> {
    item: IUiMenuContentItem<T>;
}

/**
 * @internal
 */
export type IUiMenuControlType = "keyboard" | "mouse" | "unknown";

/**
 * @internal
 */
export interface IUiMenuPluggableComponents<T extends IUiMenuItemData = object> {
    InteractiveItemComponent: React.ComponentType<UiMenuInteractiveItemProps<T>>;
    InteractiveItemWrapperComponent: React.ComponentType<UiMenuInteractiveItemWrapperProps<T>>;
    GroupItemComponent: React.ComponentType<UiMenuGroupItemProps<T>>;
    StaticItemComponent: React.ComponentType<UiMenuStaticItemProps<T>>;
    ContentItemWrapperComponent: React.ComponentType<UiMenuContentItemWrapperProps<T>>;
    ContentItemComponent: React.ComponentType<UiMenuContentItemProps<T>>;
    ContentComponent: React.ComponentType<UiMenuContentProps<T>>;
    MenuHeaderComponent: React.ComponentType;
}

/**
 * @internal
 */
export interface IUiMenuContext<T extends IUiMenuItemData = object, M = object>
    extends IUiMenuPluggableComponents<T> {
    items: IUiMenuItem<T>[];
    focusedItem: IUiMenuFocusableItem<T> | undefined;
    shownCustomContentItemId?: string;
    setShownCustomContentItemId: React.Dispatch<React.SetStateAction<string | undefined>>;
    onSelect: (item: IUiMenuFocusableItem<T> | undefined) => void;
    onClose?: () => void;
    setFocusedId: React.Dispatch<React.SetStateAction<string | undefined>>;
    isItemFocusable: (item: IUiMenuItem<T>) => boolean;
    controlType: IUiMenuControlType;
    setControlType: React.Dispatch<React.SetStateAction<IUiMenuControlType>>;
    scrollToView: (element: HTMLElement | null) => void;
    makeItemId: (item: IUiMenuItem<T>) => string;
    itemClassName?: ((item: IUiMenuItem<T>) => string | undefined) | string;
    ItemComponent: React.ComponentType<UiMenuItemProps<T>>;
    menuComponentRef: React.RefObject<HTMLElement>;
    itemsContainerRef: React.RefObject<HTMLElement>;
    menuCtxData?: M;
}

/**
 * @internal
 */
export interface UiMenuProps<T extends IUiMenuItemData = object, M = object>
    extends Partial<IUiMenuPluggableComponents<T>> {
    items: IUiMenuItem<T>[];

    className?: string;
    itemClassName?: ((item: IUiMenuItem<T>) => string | undefined) | string;
    maxWidth?: number;

    onSelect?: (item: IUiMenuInteractiveItem<T>) => void;
    onClose?: () => void;
    onUnhandledKeyDown?: (event: React.KeyboardEvent, context: IUiMenuContext<T>) => void;

    shouldKeyboardActionPreventDefault?: boolean;
    shouldKeyboardActionStopPropagation?: boolean;
    shouldCloseOnSelect?: boolean;
    isDisabledFocusable?: boolean;

    ariaAttributes: Omit<IDropdownBodyRenderProps["ariaAttributes"], "role">;
    // shared data for whole menu component
    menuCtxData?: M;
}
