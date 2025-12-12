// (C) 2021-2025 GoodData Corporation
import { type ComponentType, type ReactNode } from "react";

/**
 * @alpha
 */
export interface IMenuItemCommonProps {
    itemId: string;
    visible?: boolean;
    className?: string;
}

/**
 * @alpha
 */
export interface IMenuButtonItemButton extends IMenuItemCommonProps {
    type: "button";
    itemName: string;
    onClick?: () => void;
    /**
     * If specified, the value is shown on hover of the item as a tooltip.
     */
    tooltip?: string | ReactNode;
    disabled?: boolean;
    icon?: string | ReactNode;
    opensDialog?: boolean;
}

/**
 * @alpha
 */
export interface IMenuButtonItemMenu extends IMenuItemCommonProps {
    type: "menu";
    itemName: string;
    /**
     * If specified, the value is shown on hover of the item as a tooltip.
     */
    tooltip?: string | ReactNode;
    disabled?: boolean;
    icon?: string | ReactNode;
    items: [
        IMenuButtonItemButton | IMenuButtonItemSeparator | IMenuButtonItemHeader,
        ...(IMenuButtonItemButton | IMenuButtonItemSeparator | IMenuButtonItemHeader)[],
    ];
}

/**
 * @alpha
 */
export interface IMenuButtonItemSeparator extends IMenuItemCommonProps {
    type: "separator";
}

/**
 * @alpha
 */
export interface IMenuButtonItemHeader extends IMenuItemCommonProps {
    type: "header";
    itemName: string;
}

/**
 * @alpha
 */
export type IMenuButtonItem =
    | IMenuButtonItemButton
    | IMenuButtonItemSeparator
    | IMenuButtonItemHeader
    | IMenuButtonItemMenu;

/**
 * @alpha
 */
export interface IMenuButtonProps {
    /**
     * Items that will be in the menu.
     */
    menuItems: ReadonlyArray<IMenuButtonItem>;

    DefaultMenuButton: CustomMenuButtonComponent;
}

/**
 * @alpha
 */
export type CustomMenuButtonComponent = ComponentType<IMenuButtonProps>;

/**
 * @alpha
 */
export interface IMenuButtonConfiguration {
    /**
     * Specify custom items that will be in the menu.
     *
     * @remarks
     * Using this setting fully overrides the menu items. The default items will not be shown.
     */
    menuItems?: ReadonlyArray<IMenuButtonItem>;

    /**
     * Specify additional menu items to add on top of the default items.
     *
     * @remarks
     * If specified, this should be a list of tuples: index to add item at, the menu item to add. If you want
     * to add item at the end of the list, use index `-1`.
     */
    additionalMenuItems?: ReadonlyArray<[number, IMenuButtonItem]>;
}
