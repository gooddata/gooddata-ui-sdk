// (C) 2024-2025 GoodData Corporation

import { KeyboardEvent, MouseEvent, ReactNode, forwardRef } from "react";

import { stringUtils } from "@gooddata/util";

import { IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { IconType } from "../@types/icon.js";
import { SizeLarge, SizeMedium, SizeSmall } from "../@types/size.js";
import {
    VariantDanger,
    VariantLink,
    VariantPopOut,
    VariantPrimary,
    VariantSecondary,
    VariantTertiary,
    VariantTooltip,
} from "../@types/variant.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

/**
 * @internal
 */
export interface IUiButtonAccessibilityConfig extends IAccessibilityConfigBase {
    iconAriaHidden?: boolean;
}

/**
 * @internal
 */
export interface UiButtonProps {
    id?: string;
    size?: SizeSmall | SizeMedium | SizeLarge;
    variant?:
        | VariantPrimary
        | VariantSecondary
        | VariantTertiary
        | VariantPopOut
        | VariantDanger
        | VariantTooltip
        | VariantLink;
    disableIconAnimation?: boolean;
    iconBefore?: IconType;
    iconBeforeSize?: number;
    badgeAfter?: number;
    iconAfter?: IconType;
    iconAfterSize?: number;
    label: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    isSelected?: boolean;
    tooltip?: ReactNode;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
    dataId?: string;
    dataTestId?: string;
    accessibilityConfig?: IUiButtonAccessibilityConfig;
    maxWidth?: number;
    tabIndex?: number;
}

const { b, e } = bem("gd-ui-kit-button");

const getGeneratedTestId = (label: string, ariaLabel: string) => {
    return ariaLabel ? `${stringUtils.simplifyText(ariaLabel)}` : `${stringUtils.simplifyText(label)}`;
};

/**
 * @internal
 */
export const UiButton = forwardRef<HTMLButtonElement, UiButtonProps>(
    (
        {
            id,
            size = "medium",
            variant = "secondary",
            tabIndex = 0,
            label,
            isDisabled,
            isSelected,
            isLoading,
            disableIconAnimation,
            iconBefore,
            iconBeforeSize: iconBeforeSizeProp,
            iconAfter,
            iconAfterSize: iconAfterSizeProp,
            badgeAfter,
            onClick,
            onKeyDown,
            dataId,
            dataTestId,
            accessibilityConfig,
            maxWidth,
        },
        ref,
    ) => {
        const iconBeforeSize = iconBeforeSizeProp ?? (size === "small" ? 16 : 18);
        const iconAfterSize = iconAfterSizeProp ?? (size === "small" ? 16 : 18);
        const hasIconBefore = !!iconBefore;
        const hasIconAfter = !!iconAfter;

        const testId = dataTestId || getGeneratedTestId(label, accessibilityConfig?.ariaLabel ?? "");

        return (
            <button
                id={id}
                ref={ref}
                className={b({
                    size,
                    variant,
                    isLoading: isLoading ?? false,
                    hasIconBefore,
                    hasIconAfter,
                    isSelected: isSelected ?? false,
                })}
                disabled={isDisabled}
                tabIndex={tabIndex}
                onClick={onClick}
                onKeyDown={onKeyDown}
                data-id={dataId}
                data-testid={testId}
                aria-label={accessibilityConfig?.ariaLabel}
                aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                aria-describedby={accessibilityConfig?.ariaDescribedBy}
                aria-expanded={accessibilityConfig?.ariaExpanded}
                aria-description={accessibilityConfig?.ariaDescription}
                aria-controls={accessibilityConfig?.ariaControls}
                aria-haspopup={accessibilityConfig?.ariaHaspopup}
                role={accessibilityConfig?.role}
            >
                {iconBefore ? (
                    <UiIcon
                        type={iconBefore}
                        size={iconBeforeSize}
                        ariaHidden={accessibilityConfig?.iconAriaHidden}
                        disableAnimation={disableIconAnimation}
                    />
                ) : null}
                <span className={e("text")} style={{ maxWidth }}>
                    {label}
                </span>
                {badgeAfter === undefined ? null : <span className={e("badge")}>({badgeAfter})</span>}
                {iconAfter ? (
                    <UiIcon
                        type={iconAfter}
                        size={iconAfterSize}
                        ariaHidden={accessibilityConfig?.iconAriaHidden}
                        disableAnimation={disableIconAnimation}
                    />
                ) : null}
            </button>
        );
    },
);

UiButton.displayName = "UiButton";
