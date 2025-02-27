// (C) 2020-2025 GoodData Corporation

import { ReactNode } from "react";
/**
 * @internal
 */
export interface IAccessibilityConfigBase {
    ariaLabel?: React.AriaAttributes["aria-label"];
    ariaLabelledBy?: React.AriaAttributes["aria-labelledby"];
    ariaDescribedBy?: React.AriaAttributes["aria-describedby"];
}
/**
 * @internal
 */
export interface IDropdownAccessibilityConfig extends IAccessibilityConfigBase {
    isExpanded: boolean;
    popupId: string;
}

/**
 * @internal
 */
export interface IButtonProps {
    id?: string;
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
    onClick?(e: React.MouseEvent): void;
    variant?: "primary" | "secondary";
    intent?: "action" | "positive" | "negative";
    size?: "small" | "medium" | "large";
    /**
     * @deprecated use `accessibilityConfig.ariaLabel` instead
     */
    ariaLabel?: string;
    accessibilityConfig?: IDropdownAccessibilityConfig;
    buttonRef?: React.MutableRefObject<HTMLElement>;
}
