// (C) 2020-2025 GoodData Corporation

import { AriaAttributes, MouseEvent, ReactNode } from "react";

import { IAccessibilityConfigBase } from "../typings/accessibility.js";
/**
 * @internal
 */
export interface IDropdownButtonAccessibilityConfig {
    isExpanded?: boolean;
    popupType?: AriaAttributes["aria-haspopup"];
    popupId?: string;
}

/**
 * @internal
 */
export interface IButtonAccessibilityConfig
    extends IAccessibilityConfigBase,
        IDropdownButtonAccessibilityConfig {}

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
