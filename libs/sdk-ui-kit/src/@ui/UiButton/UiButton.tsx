// (C) 2024-2025 GoodData Corporation

import { forwardRef, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { IconType } from "../@types/icon.js";
import { SizeLarge, SizeMedium, SizeSmall } from "../@types/size.js";
import {
    VariantDanger,
    VariantPopOut,
    VariantTooltip,
    VariantPrimary,
    VariantSecondary,
    VariantTertiary,
    VariantLink,
} from "../@types/variant.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { stringUtils } from "@gooddata/util";

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
    iconBefore?: IconType;
    iconAfter?: IconType;
    label: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    tooltip?: ReactNode;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
    dataId?: string;
    dataTestId?: string;
    accessibilityConfig?: IUiButtonAccessibilityConfig;
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
            label,
            isDisabled,
            isLoading,
            iconBefore,
            iconAfter,
            onClick,
            onKeyDown,
            dataId,
            dataTestId,
            accessibilityConfig,
        },
        ref,
    ) => {
        const iconSize = size === "small" ? 16 : 18;
        const hasIconBefore = !!iconBefore;
        const hasIconAfter = !!iconAfter;

        const testId = dataTestId ? dataTestId : getGeneratedTestId(label, accessibilityConfig?.ariaLabel);

        return (
            <button
                id={id}
                ref={ref}
                className={b({ size, variant, isLoading, hasIconBefore, hasIconAfter })}
                disabled={isDisabled}
                tabIndex={0}
                onClick={onClick}
                onKeyDown={onKeyDown}
                data-id={dataId}
                data-testid={testId}
                aria-label={accessibilityConfig?.ariaLabel}
                aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                aria-describedby={accessibilityConfig?.ariaDescribedBy}
                aria-expanded={accessibilityConfig?.ariaExpanded}
                role={accessibilityConfig?.role}
            >
                {iconBefore ? (
                    <UiIcon
                        type={iconBefore}
                        size={iconSize}
                        ariaHidden={accessibilityConfig?.iconAriaHidden}
                    />
                ) : null}
                <span className={e("text")}>{label}</span>
                {iconAfter ? (
                    <UiIcon
                        type={iconAfter}
                        size={iconSize}
                        ariaHidden={accessibilityConfig?.iconAriaHidden}
                    />
                ) : null}
            </button>
        );
    },
);

UiButton.displayName = "UiButton";
