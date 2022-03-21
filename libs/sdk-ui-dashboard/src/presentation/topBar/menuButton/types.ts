// (C) 2021-2022 GoodData Corporation
import { ComponentType } from "react";

/**
 * @alpha
 */
export interface IMenuButtonItemButton {
    type: "button";
    itemId: string;
    itemName: string;
    onClick?: () => void;
    /**
     * If specified, the value is shown on hover of the item as a tooltip.
     */
    tooltip?: string;
    disabled?: boolean;
    visible?: boolean;
}

/**
 * @alpha
 */
export interface IMenuButtonItemSeparator {
    type: "separator";
    itemId: string;
}

/**
 * @alpha
 */
export interface IMenuButtonItemHeader {
    type: "header";
    itemId: string;
    itemName: string;
}

/**
 * @alpha
 */
export type IMenuButtonItem = IMenuButtonItemButton | IMenuButtonItemSeparator | IMenuButtonItemHeader;

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
