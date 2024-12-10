// (C) 2024 GoodData Corporation

import React from "react";
import { SizeSmall, SizeMedium, SizeLarge } from "../@types/size.js";
import {
    VariantPrimary,
    VariantSecondary,
    VariantTertiary,
    VariantPopOut,
    VariantDanger,
} from "../@types/variant.js";
import { bem } from "../@utils/bem.js";
import { IconType } from "../@types/icon.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

/**
 * @internal
 */
export interface UiButtonProps {
    size?: SizeSmall | SizeMedium | SizeLarge;
    variant?: VariantPrimary | VariantSecondary | VariantTertiary | VariantPopOut | VariantDanger;
    iconBefore?: IconType;
    iconAfter?: IconType;
    label: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    tooltip?: React.ReactNode;
    onClick?: () => void;
}

const { b, e } = bem("gd-ui-kit-button");

/**
 * @internal
 */
export const UiButton = ({
    size = "medium",
    variant = "secondary",
    label,
    isDisabled,
    isLoading,
    iconBefore,
    iconAfter,
}: UiButtonProps) => {
    const iconPosition = iconBefore ? "left" : iconAfter ? "right" : undefined;

    return (
        <button className={b({ size, variant, isLoading, iconPosition })} disabled={isDisabled} tabIndex={0}>
            {iconBefore ? (
                <span className={e("icon")}>
                    <UiIcon type={iconBefore} label={label} size={14} />
                </span>
            ) : null}
            <span className={e("text")}>{label}</span>
            {iconAfter ? (
                <span className={e("icon")}>
                    <UiIcon type={iconAfter} label={label} size={14} />
                </span>
            ) : null}
        </button>
    );
};
