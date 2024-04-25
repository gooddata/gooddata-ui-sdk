// (C) 2020-2024 GoodData Corporation

import { ReactNode } from "react";

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
}
