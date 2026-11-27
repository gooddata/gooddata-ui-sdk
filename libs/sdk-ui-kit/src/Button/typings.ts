// (C) 2020-2026 GoodData Corporation

import { type AriaAttributes, type MouseEvent, type ReactNode } from "react";

import { type IAccessibilityConfigBase } from "../typings/accessibility.js";
/**
 * @internal
 */
export interface IDropdownButtonAccessibilityConfig {
    isExpanded?: boolean;
    popupType?: AriaAttributes["aria-haspopup"];
    popupId?: string;
    ariaHaspopup?: AriaAttributes["aria-haspopup"];
}

/**
 * @internal
 */
export interface IButtonAccessibilityConfig
    extends IAccessibilityConfigBase, IDropdownButtonAccessibilityConfig {
    /**
     * Overrides the aria-disabled state derived from the disabled prop. Use it when the button must
     * be announced as unavailable but its click handler must still run (for example to move the focus
     * to the field that makes the action unavailable).
     */
    ariaDisabled?: AriaAttributes["aria-disabled"];
}

/**
 * @internal
 */
export interface IButtonProps {
    id?: string;
    dataId?: string;
    dataTestId?: string;
    className?: string;
    disabled?: boolean;
    tabIndex?: number;
    tagName?: string;
    title?: string;
    type?: HTMLButtonElement["type"];
    value?: ReactNode;
    children?: ReactNode;
    iconLeft?: string;
    iconRight?: string;
    onClick?(e: MouseEvent): void;
    variant?: "primary" | "secondary";
    intent?: "action" | "positive" | "negative";
    size?: "small" | "medium" | "large";
    accessibilityConfig?: IButtonAccessibilityConfig;
    describedByFromValidation?: boolean;
}
