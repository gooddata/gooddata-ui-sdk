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
