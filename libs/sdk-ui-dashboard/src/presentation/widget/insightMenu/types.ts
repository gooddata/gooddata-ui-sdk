// (C) 2020-2022 GoodData Corporation
import { ComponentType, MouseEvent } from "react";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";

///
/// Component props
///

/**
 * @alpha
 */
export interface IInsightMenuItemButton {
    type: "button";
    itemId: string;
    itemName: string;
    onClick?: (e: MouseEvent) => void;
    /**
     * If specified, the value is shown on hover of the item as a tooltip.
     */
    tooltip?: string;
    disabled?: boolean;
    icon?: JSX.Element | string;
    /**
     * Additional class names to be applied to the item.
     */
    className?: string;
}
/**
 * @alpha
 */
export interface IInsightMenuItemSeparator {
    type: "separator";
    itemId: string;
}

/**
 * @alpha
 */
export interface IInsightMenuSubmenu {
    type: "submenu";
    itemId: string;
    itemName: string;
    SubmenuComponent: ComponentType<{ widget: IInsightWidget }>;
    /**
     * If specified, the value is shown on hover of the item as a tooltip.
     */
    tooltip?: string;
    disabled?: boolean;
    icon?: JSX.Element | string;
    /**
     * Additional class names to be applied to the item.
     */
    className?: string;
}

/**
 * @alpha
 */
export type IInsightMenuItem = IInsightMenuItemButton | IInsightMenuItemSeparator | IInsightMenuSubmenu;

/**
 * @alpha
 */
export interface IDashboardInsightMenuButtonProps {
    widget: IInsightWidget;
    insight: IInsight;
    isOpen: boolean;
    onClick: () => void;
    items: IInsightMenuItem[];
}

/**
 * @alpha
 */
export interface IDashboardInsightMenuProps {
    widget: IInsightWidget;
    insight: IInsight;
    isOpen: boolean;
    onClose: () => void;
    items: IInsightMenuItem[];
}

///
/// Custom component types
///

/**
 * @alpha
 */
export type CustomDashboardInsightMenuButtonComponent = ComponentType<IDashboardInsightMenuButtonProps>;

/**
 * @alpha
 */
export type CustomDashboardInsightMenuComponent = ComponentType<IDashboardInsightMenuProps>;
