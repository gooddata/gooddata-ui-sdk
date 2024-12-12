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
    buttonRef?: React.RefObject<HTMLButtonElement>;
    size?: SizeSmall | SizeMedium | SizeLarge;
    variant?: VariantPrimary | VariantSecondary | VariantTertiary | VariantPopOut | VariantDanger;
    iconBefore?: IconType;
    iconAfter?: IconType;
    label: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    tooltip?: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const { b, e } = bem("gd-ui-kit-button");

/**
 * @internal
 */
export const UiButton = ({
    buttonRef,
    size = "medium",
    variant = "secondary",
    label,
    isDisabled,
    isLoading,
    iconBefore,
    iconAfter,
    onClick,
}: UiButtonProps) => {
    const iconPosition = iconBefore ? "left" : iconAfter ? "right" : undefined;

    return (
        <button
            ref={buttonRef}
            className={b({ size, variant, isLoading, iconPosition })}
            disabled={isDisabled}
            tabIndex={0}
            onClick={onClick}
        >
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
