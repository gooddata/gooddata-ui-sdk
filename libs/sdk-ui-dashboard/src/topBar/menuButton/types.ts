// (C) 2021 GoodData Corporation
import { ComponentType } from "react";

/**
 * @alpha
 */
export interface IMenuButtonItem {
    itemId: string;
    itemName: string;
    onClick?: () => void;
    /**
     * If type is not specified, then common menu button item rendered.
     */
    type?: "separator" | "header";
}

/**
 * @alpha
 */
export interface IMenuButtonProps {
    /**
     * Items that will be in the menu.
     */
    menuItems: IMenuButtonItem[];
}

/**
 * @alpha
 */
export type CustomMenuButtonComponent = ComponentType;

/**
 * @alpha
 */
export interface IMenuButtonConfiguration {
    /**
     * Optionally specify custom items that will be in the menu. Using this setting fully overrides the
     * menu items. The default items will not be shown.
     */
    menuItems?: IMenuButtonItem[];

    /**
     * Optionally specify additional menu items to add on top of the default items.
     *
     * If specified, this should be a list of tuples: index to add item at, the menu item to add. If you want
     * to add item at the end of the list, use index `-1`.
     */
    additionalMenuItems?: [number, IMenuButtonItem][];
}
