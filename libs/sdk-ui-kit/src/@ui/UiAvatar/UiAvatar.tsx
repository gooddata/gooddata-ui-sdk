// (C) 2026 GoodData Corporation

import { type CSSProperties } from "react";

import { type IconType } from "../@types/icon.js";
import { type ThemeColor } from "../@types/themeColors.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

const { b } = bem("gd-ui-kit-avatar");

/**
 * @internal
 */
export interface IUiAvatarProps {
    /** Icon rendered inside the circle. */
    icon: IconType;
    /** Outer circle size in px. Defaults to 32. */
    size?: number;
    /** Background tone of the circle. Defaults to `complementary-2`. */
    backgroundColor?: ThemeColor;
    /** Icon tone. Defaults to `complementary-5`. */
    iconColor?: ThemeColor;
    /**
     * Icon size in px. Defaults to `Math.round(size * ICON_TO_AVATAR_RATIO)`,
     * which mirrors the 14/32 proportion used across the kit's avatars.
     */
    iconSize?: number;
    /**
     * Accessibility config for the avatar. Provide an `ariaLabel`
     * when the avatar carries meaning (e.g. a stand-alone "who" indicator).
     * Use `ariaHidden: true` when the avatar sits next to a visible
     * name and would only duplicate that name for screen-reader users.
     */
    accessibilityConfig?: { ariaLabel?: string; ariaHidden?: boolean };
    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

const DEFAULT_SIZE = 32;
const DEFAULT_BACKGROUND: ThemeColor = "complementary-2";
const DEFAULT_ICON_COLOR: ThemeColor = "complementary-5";
const ICON_TO_AVATAR_RATIO = 0.44;

/**
 * Circle avatar with a centered icon. Generic small "who" indicator
 * (grantees, presence, audit log, activity feed, ...). Wrap in a
 * domain-specific component to pick the right icon + label per kind.
 *
 * @internal
 */
export function UiAvatar({
    icon,
    size = DEFAULT_SIZE,
    backgroundColor = DEFAULT_BACKGROUND,
    iconColor = DEFAULT_ICON_COLOR,
    iconSize,
    accessibilityConfig,
    dataTestId,
}: IUiAvatarProps) {
    const resolvedIconSize = iconSize ?? Math.round(size * ICON_TO_AVATAR_RATIO);
    return (
        <span
            className={b({ background: backgroundColor })}
            data-testid={dataTestId}
            style={{ "--gd-avatar-size": `${size}px` } as CSSProperties}
        >
            <UiIcon
                type={icon}
                size={resolvedIconSize}
                color={iconColor}
                accessibilityConfig={accessibilityConfig}
            />
        </span>
    );
}
