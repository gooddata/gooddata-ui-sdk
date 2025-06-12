// (C) 2024-2025 GoodData Corporation
import React from "react";
import { IconType } from "../@types/icon.js";
import { ThemeColor } from "../@types/themeColors.js";
import { b } from "./iconBem.js";
import { iconPaths } from "./icons.js";

/**
 * @internal
 */
export interface UiIconProps {
    type: IconType;
    color?: ThemeColor;
    label?: string;
    size?: number;
    ariaHidden?: boolean;
}

/**
 * @internal
 */
export const UiIcon = ({ type, label, color, ariaHidden, size = 20 }: UiIconProps) => {
    return (
        <svg className={b({ color })} width={size} height={size} viewBox="0 0 20 20" aria-hidden={ariaHidden}>
            {label ? <title>{label}</title> : null}
            {iconPaths[type]}
        </svg>
    );
};
