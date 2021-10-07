// (C) 2020-2021 GoodData Corporation
import { ComponentType } from "react";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import { IInsight } from "@gooddata/sdk-model";

///
/// Custom component types
///

/**
 * @alpha
 */
export type CustomDashboardInsightMenuButtonComponent = ComponentType;

/**
 * @alpha
 */
export type CustomDashboardInsightMenuComponent = ComponentType;

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
    onClick?: () => void;
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
export type IInsightMenuItem = IInsightMenuItemButton | IInsightMenuItemSeparator;

/**
 * @internal
 */
export interface IDashboardInsightMenuButtonProps {
    widget: IInsightWidget;
    insight: IInsight;
    isOpen: boolean;
    onClick: () => void;
    items: IInsightMenuItem[];
}

/**
 * @internal
 */
export interface IDashboardInsightMenuProps {
    widget: IInsightWidget;
    insight: IInsight;
    isOpen: boolean;
    onClose: () => void;
    items: IInsightMenuItem[];
}
