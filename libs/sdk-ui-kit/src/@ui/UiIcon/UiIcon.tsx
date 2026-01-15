// (C) 2024-2026 GoodData Corporation

import { type AriaAttributes } from "react";

import { b } from "./iconBem.js";
import { iconPaths } from "./icons.js";
import { UiIconBackground } from "./UiIconBackground.js";
import { type BackgroundShape, type BackgroundType } from "../@types/background.js";
import { type IconType } from "../@types/icon.js";
import { type ThemeColor } from "../@types/themeColors.js";

/**
 * @internal
 */
export interface IUiIconProps {
    type: IconType;
    color?: ThemeColor | "currentColor";
    size?: number;
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
    accessibilityConfig?: {
        ariaLabel?: AriaAttributes["aria-label"];
        ariaHidden?: boolean;
    };
}

/**
 * @internal
 */
export function UiIcon({
    type,
    color,
    layout = "inline",
    disableAnimation,
    accessibilityConfig,
    size = 20,
    backgroundSize,
    backgroundColor,
    backgroundType,
    backgroundShape,
}: IUiIconProps) {
    // If ariaHidden is explicitly set, use it. Otherwise, use ariaLabel to determine if the icon is hidden.
    const effectiveAriaHidden = accessibilityConfig?.ariaHidden ?? !accessibilityConfig?.ariaLabel;

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
                aria-hidden={effectiveAriaHidden}
                aria-label={accessibilityConfig?.ariaLabel}
                role="img"
            >
                {iconPaths[type]}
            </svg>
        </UiIconBackground>
    );
}
