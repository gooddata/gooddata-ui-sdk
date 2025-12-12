// (C) 2024-2025 GoodData Corporation

import { b } from "./iconBem.js";
import { iconPaths } from "./icons.js";
import { UiIconBackground } from "./UiIconBackground.js";
import { type BackgroundShape, type BackgroundType } from "../@types/background.js";
import { type IconType } from "../@types/icon.js";
import { type ThemeColor } from "../@types/themeColors.js";

/**
 * @internal
 */
export interface UiIconProps {
    type: IconType;
    color?: ThemeColor | "currentColor";
    label?: string;
    size?: number;
    ariaHidden?: boolean;
    disableAnimation?: boolean;
    //background
    backgroundSize?: number;
    backgroundColor?: ThemeColor;
    backgroundType?: BackgroundType;
    backgroundShape?: BackgroundShape;
    /**
     * SVGs are inline by default. The icon can be set to block to behave better in flex layouts and similar.
     * @defaultValue "inline"
     */
    layout?: "block" | "inline";
}

/**
 * @internal
 */
export function UiIcon({
    type,
    label,
    color,
    layout = "inline",
    disableAnimation,
    ariaHidden,
    size = 20,
    backgroundSize,
    backgroundColor,
    backgroundType,
    backgroundShape,
}: UiIconProps) {
    return (
        <UiIconBackground
            size={backgroundSize}
            color={backgroundColor}
            type={backgroundType}
            shape={backgroundShape}
        >
            <svg
                className={b({ color: color ?? false, layout, disableAnimation: disableAnimation ?? false })}
                width={size}
                height={size}
                viewBox="0 0 20 20"
                aria-hidden={ariaHidden}
            >
                {label ? <title>{label}</title> : null}
                {iconPaths[type]}
            </svg>
        </UiIconBackground>
    );
}
