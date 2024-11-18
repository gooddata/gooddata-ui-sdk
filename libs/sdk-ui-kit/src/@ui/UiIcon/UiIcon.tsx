// (C) 2024 GoodData Corporation
import React from "react";
import { b } from "./iconBem.js";
import { iconsConfig } from "./icons.js";
import { ThemeColor } from "../@types/themeColors.js";
import { IconType } from "../@types/icon.js";

/**
 * @internal
 */
export interface UiIconProps {
    type: IconType;
    color?: ThemeColor;
    label: string;
    size?: number;
}

/**
 * @internal
 */
export const UiIcon = ({ type, label, color, size = 20 }: UiIconProps) => {
    return (
        <svg
            className={b({ color })}
            viewBox={iconsConfig[type].viewBox}
            width={size}
            height={size}
            preserveAspectRatio="xMidYMid meet"
        >
            <title>{label}</title>
            {iconsConfig[type].content}
        </svg>
    );
};
