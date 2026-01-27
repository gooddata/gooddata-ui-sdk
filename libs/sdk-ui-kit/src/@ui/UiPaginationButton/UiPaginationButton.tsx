// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, forwardRef } from "react";

import { simplifyText } from "@gooddata/util";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { type IconType } from "../@types/icon.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

/**
 * Size variant for UiPaginationButton.
 *
 * @internal
 */
export type UiPaginationButtonSize = "small" | "large";

/**
 * Direction of the pagination button arrow.
 *
 * @internal
 */
export type UiPaginationButtonDirection = "previous" | "next";

/**
 * Props for the UiPaginationButton component.
 *
 * @internal
 */
export interface IUiPaginationButtonProps {
    /**
     * Direction of the arrow icon.
     * - "previous" shows left arrow (paginationLeft)
     * - "next" shows right arrow (paginationRight)
     */
    direction: UiPaginationButtonDirection;

    /**
     * Accessible label for the button.
     */
    label: string;

    /**
     * Size of the button.
     * - "small" (22x22) - for desktop views
     * - "large" (32x32) - for mobile views
     * @defaultValue "small"
     */
    size?: UiPaginationButtonSize;

    /**
     * Whether the button is disabled.
     */
    isDisabled?: boolean;

    /**
     * Whether the button is in active/selected state.
     */
    isActive?: boolean;

    /**
     * Click handler.
     */
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;

    /**
     * Keyboard event handler.
     */
    onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;

    /**
     * Data attribute for tracking/analytics.
     */
    dataId?: string;

    /**
     * Data attribute for testing.
     */
    dataTestId?: string;

    /**
     * Tab index for keyboard navigation.
     */
    tabIndex?: number;

    /**
     * HTML id attribute.
     */
    id?: string;

    /**
     * Accessibility configuration for ARIA attributes.
     */
    accessibilityConfig?: IAccessibilityConfigBase;
}

const { b } = bem("gd-ui-kit-pagination-button");

const ICON_MAP: Record<UiPaginationButtonDirection, IconType> = {
    previous: "navigateLeft",
    next: "navigateRight",
};

/**
 * A circular button used for pagination navigation (previous/next).
 *
 * @remarks
 * The button has a circular shape with a light gray background that darkens on hover.
 * The icon color inverts to white when hovered or active.
 *
 * @internal
 */
export const UiPaginationButton = forwardRef<HTMLButtonElement, IUiPaginationButtonProps>(
    (
        {
            direction,
            label,
            size = "small",
            isDisabled,
            isActive,
            onClick,
            onKeyDown,
            dataId,
            dataTestId,
            tabIndex,
            id,
            accessibilityConfig,
        },
        ref,
    ) => {
        const icon = ICON_MAP[direction];
        const testId = dataTestId ?? `pagination-button-${simplifyText(label)}`;

        return (
            <button
                ref={ref}
                className={b({ size, isActive: isActive ?? false })}
                id={id}
                disabled={isDisabled}
                onClick={onClick}
                onKeyDown={onKeyDown}
                data-id={dataId}
                data-testid={testId}
                aria-disabled={isDisabled}
                aria-label={label}
                tabIndex={tabIndex}
                type="button"
                {...accessibilityConfigToAttributes(accessibilityConfig)}
            >
                <UiIcon type={icon} size={18} />
            </button>
        );
    },
);

UiPaginationButton.displayName = "UiPaginationButton";
