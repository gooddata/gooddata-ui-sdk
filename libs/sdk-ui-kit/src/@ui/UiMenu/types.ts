// (C) 2025 GoodData Corporation

import { ComponentType, Dispatch, KeyboardEvent, ReactNode, RefObject, SetStateAction } from "react";

import { IDropdownBodyRenderProps } from "../../Dropdown/index.js";
import { SizeMedium, SizeSmall } from "../@types/size.js";

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
    isSelected?: boolean;
    data: T["interactive"];
    subItems?: IUiMenuItem<T>[];
    iconRight?: ReactNode;
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
    Component: ComponentType<{
        onBack: () => void;
        onClose: () => void;
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
export interface IUiMenuItemProps<T extends IUiMenuItemData = object> {
    item: IUiMenuItem<T>;
}

/**
 * @internal
 */
export interface IUiMenuInteractiveItemWrapperProps<T extends IUiMenuItemData = object> {
    item: IUiMenuInteractiveItem<T>;
}

/**
 * @internal
 */
export interface IUiMenuContentItemWrapperProps<T extends IUiMenuItemData = object> {
    item: IUiMenuContentItem<T>;
}

/**
 * @internal
 */
export interface IUiMenuInteractiveItemProps<T extends IUiMenuItemData = object> {
    item: IUiMenuInteractiveItem<T>;

    isFocused: boolean;

    onSelect: () => void;

    size?: SizeSmall | SizeMedium;
}

/**
 * @internal
 */
export interface IUiMenuGroupItemProps<T extends IUiMenuItemData = object> {
    item: IUiMenuGroupItem<T>;
}

/**
 * @internal
 */
export interface IUiMenuStaticItemProps<T extends IUiMenuItemData = object> {
    item: IUiMenuStaticItem<T>;
}

/**
 * @internal
 */
export interface IUiMenuContentItemProps<T extends IUiMenuItemData = object> {
    item: IUiMenuContentItem<T>;
    isFocused: boolean;
    onSelect: () => void;
}

/**
 * @internal
 */
export interface IUiMenuContentProps<T extends IUiMenuItemData = object> {
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
    InteractiveItem: ComponentType<IUiMenuInteractiveItemProps<T>>;
    InteractiveItemWrapper: ComponentType<IUiMenuInteractiveItemWrapperProps<T>>;
    GroupItem: ComponentType<IUiMenuGroupItemProps<T>>;
    StaticItem: ComponentType<IUiMenuStaticItemProps<T>>;
    ContentItemWrapper: ComponentType<IUiMenuContentItemWrapperProps<T>>;
    ContentItem: ComponentType<IUiMenuContentItemProps<T>>;
    Content: ComponentType<IUiMenuContentProps<T>>;
    MenuHeader: ComponentType;
}

/**
 * @internal
 */
export interface IUiMenuContext<T extends IUiMenuItemData = object, M = object>
    extends IUiMenuPluggableComponents<T> {
    items: IUiMenuItem<T>[];
    focusedItem: IUiMenuFocusableItem<T> | undefined;
    shownCustomContentItemId?: string;
    setShownCustomContentItemId: Dispatch<SetStateAction<string | undefined>>;
    onSelect: (item: IUiMenuFocusableItem<T> | undefined) => void;
    onClose?: () => void;
    setFocusedId: Dispatch<SetStateAction<string | undefined>>;
    isItemFocusable: (item: IUiMenuItem<T>) => boolean;
    controlType: IUiMenuControlType;
    setControlType: Dispatch<SetStateAction<IUiMenuControlType>>;
    scrollToView: (element: HTMLElement | null) => void;
    makeItemId: (item: IUiMenuItem<T>) => string | undefined;
    /**
     * @deprecated use `itemDataTestId` instead. Prop will be removed.
     */
    itemClassName?: ((item: IUiMenuItem<T>) => string | undefined) | string;
    itemDataTestId?: ((item: IUiMenuItem<T>) => string | undefined) | string;
    ItemComponent: ComponentType<IUiMenuItemProps<T>>;
    menuComponentRef: RefObject<HTMLElement>;
    itemsContainerRef: RefObject<HTMLElement>;
    menuCtxData?: M;
}

/**
 * @internal
 */
export interface UiMenuProps<T extends IUiMenuItemData = object, M = object>
    extends Partial<IUiMenuPluggableComponents<T>> {
    items: IUiMenuItem<T>[];

    dataTestId?: ((context: IUiMenuContext<T>) => string | undefined) | string;

    itemDataTestId?: ((item: IUiMenuItem<T>) => string | undefined) | string;

    maxWidth?: number;
    maxHeight?: ((context: IUiMenuContext<T>) => number | undefined) | number;

    containerBottomPadding?: "none" | "small" | "medium";

    onSelect?: (item: IUiMenuInteractiveItem<T>) => void;
    onLevelChange?: (level: number, item?: IUiMenuContentItem<T> | IUiMenuInteractiveItem<T>) => void;
    onClose?: () => void;
    onUnhandledKeyDown?: (event: KeyboardEvent, context: IUiMenuContext<T>) => void;

    shouldKeyboardActionPreventDefault?: boolean;
    shouldKeyboardActionStopPropagation?: boolean;
    shouldCloseOnSelect?: boolean;
    isDisabledFocusable?: boolean;

    ariaAttributes: Omit<IDropdownBodyRenderProps["ariaAttributes"], "role">;
    // shared data for whole menu component
    menuCtxData?: M;
}
