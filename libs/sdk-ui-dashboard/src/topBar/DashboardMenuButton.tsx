// (C) 2021 GoodData Corporation
import React, { ComponentType } from "react";

/**
 * @internal
 */
export interface IDashboardMenuButtonProps {
    onMenuItemHover: (itemId: string) => void;
    onMenuItemClicked: (itemId: string) => void;
}

export type MenuButtonItem = {
    itemId: string;
    itemName: string;
    callback: () => void;
};

export interface IDefaultMenuButtonProps {
    /**
     * Optionally specify how the menu button looks like
     */
    ButtonComponent?: React.FC;

    /**
     * Optionally specify custom items that will be in the menu. Using this setting fully overrides the
     * menu items. The default items will not be shown.
     */
    MenuItems?: MenuButtonItem[];

    /**
     * Optionally specify additional menu items to add on top of the default items.
     *
     * If specified, this should be a list of tuples: index to add item at, the menu item to add. If you want
     * to add item at the end of the list, use index `-1`.
     */
    AdditionalMenuItems?: [number, MenuButtonItem][];
}

/**
 * Default implementation of the menu. Apart from fulfilling the dashboard menu contract, the default implementation
 * allows customization of the button itself.
 *
 * @internal
 */
export const DashboardMenuButton: React.FC<IDashboardMenuButtonProps & IDefaultMenuButtonProps> = (
    _props: IDashboardMenuButtonProps & IDefaultMenuButtonProps,
) => {
    return null;
};

/**
 * @internal
 */
export type DashboardMenuButtonComponent = ComponentType<IDashboardMenuButtonProps>;
