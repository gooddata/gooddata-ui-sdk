// (C) 2020-2025 GoodData Corporation

import { ReactNode } from "react";
import { IAccessibilityConfigBase } from "../typings/accessibility.js";

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
    accessibilityConfig?: IAccessibilityConfigBase;
}
