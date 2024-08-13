// (C) 2020-2024 GoodData Corporation
import { ComponentType, MouseEvent, ReactNode } from "react";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";
import { RenderMode } from "../../../types.js";

///
/// Component props
///

/**
 * @beta
 */
export interface IInsightMenuItemButton {
    type: "button";
    itemId: string;
    itemName: string;
    onClick?: (e: MouseEvent) => void;
    /**
     * If specified, the value is shown on hover of the item as a tooltip.
     */
    tooltip?: string | ReactNode;
    disabled?: boolean;
    icon?: JSX.Element | string;
    /**
     * Additional class names to be applied to the item.
     */
    className?: string;
}
/**
 * @beta
 */
export interface IInsightMenuItemSeparator {
    type: "separator";
    itemId: string;
}

/**
 * @alpha
 */
export interface IInsightMenuSubmenuComponentProps {
    /**
     * The widget for which the menu is rendered.
     */
    widget: IInsightWidget;
    /**
     * Closes the insight menu.
     */
    onClose: () => void;
    /**
     * Go back to the root menu.
     */
    onGoBack: () => void;
}

/**
 * @beta
 */
export interface IInsightMenuSubmenu {
    type: "submenu";
    itemId: string;
    itemName: string;
    /** @alpha */
    SubmenuComponent: ComponentType<IInsightMenuSubmenuComponentProps>;
    /**
     * Should the submenu component be rendered only?
     * If so, it won't be wrapped inside the default container
     * and the default header won't be rendered.
     * @alpha
     */
    renderSubmenuComponentOnly?: boolean;
    /**
     * If specified, the value is shown on hover of the item as a tooltip.
     */
    tooltip?: string | ReactNode;
    disabled?: boolean;
    icon?: JSX.Element | string;
    /**
     * Additional class names to be applied to the item.
     */
    className?: string;
    onClick?: (e: MouseEvent) => void;
}

/**
 * @beta
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

/**
 * @internal
 */
export interface IDashboardInsightMenuTitleProps {
    widget: IInsightWidget;
    insight: IInsight;
    renderMode: RenderMode;
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

/**
 * @internal
 */
export type CustomDashboardInsightMenuTitleComponent = ComponentType<IDashboardInsightMenuTitleProps>;
