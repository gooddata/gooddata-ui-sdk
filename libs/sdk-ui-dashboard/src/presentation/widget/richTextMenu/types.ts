// (C) 2020-2025 GoodData Corporation
import { ComponentType, ReactNode, MouseEvent, ReactElement } from "react";
import { IRichTextWidget } from "@gooddata/sdk-model";

import { RenderMode } from "../../../types.js";

///
/// Component props
///

/**
 * @alpha
 */
export interface IRichTextMenuItemButton {
    type: "button";
    itemId: string;
    itemName: string;
    onClick?: (e: MouseEvent) => void;
    /**
     * If specified, the value is shown on hover of the item as a tooltip.
     */
    tooltip?: string | ReactNode;
    disabled?: boolean;
    icon?: ReactElement | string;
    /**
     * Additional class names to be applied to the item.
     */
    className?: string;
}

/**
 * @alpha
 */
export interface IIRichTextMenuItemSeparator {
    type: "separator";
    itemId: string;
}

/**
 * @alpha
 */
export type IRichTextMenuItem = IRichTextMenuItemButton | IIRichTextMenuItemSeparator | IRichTextMenuSubmenu;

/**
 * @alpha
 */
export interface IDashboardRichTextMenuButtonProps {
    widget: IRichTextWidget;
    isOpen: boolean;
    onClick: () => void;
    items: IRichTextMenuItem[];
}

/**
 * @alpha
 */
export interface IDashboardRichTextMenuProps {
    widget: IRichTextWidget;
    isOpen: boolean;
    onClose: () => void;
    items: IRichTextMenuItem[];
}

/**
 * @internal
 */
export interface IDashboardRichTextMenuTitleProps {
    widget: IRichTextWidget;
    renderMode: RenderMode;
}

/**
 * @alpha
 */
export interface IRichTextMenuSubmenuComponentProps {
    /**
     * The widget for which the menu is rendered.
     */
    widget: IRichTextWidget;
    /**
     * Closes the insight menu.
     */
    onClose: () => void;
    /**
     * Go back to the root menu.
     */
    onGoBack: () => void;

    /**
     * If true, the title configuration is shown in submenu.
     * default: true
     */
    enableTitleConfig?: boolean;
}

/**
 * @alpha
 */
export interface IRichTextMenuSubmenu {
    type: "submenu";
    itemId: string;
    itemName: string;
    /** @alpha */
    SubmenuComponent: ComponentType<IRichTextMenuSubmenuComponentProps>;
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
    icon?: ReactElement | string;
    /**
     * Additional class names to be applied to the item.
     */
    className?: string;
    onClick?: (e: MouseEvent) => void;
}

export function isRichTextMenuSubmenu(obj: IRichTextMenuItem): obj is IRichTextMenuSubmenu {
    return obj !== null && obj.type === "submenu";
}

///
/// Custom component types
///

/**
 * @alpha
 */
export type CustomDashboardRichTextMenuButtonComponent = ComponentType<IDashboardRichTextMenuButtonProps>;

/**
 * @alpha
 */
export type CustomDashboardRichTextMenuComponent = ComponentType<IDashboardRichTextMenuProps>;

/**
 * @internal
 */
export type CustomDashboardRichTextMenuTitleComponent = ComponentType<IDashboardRichTextMenuTitleProps>;
