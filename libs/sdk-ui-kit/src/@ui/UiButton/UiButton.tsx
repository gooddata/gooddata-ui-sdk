// (C) 2024-2025 GoodData Corporation

import React from "react";
import { IconType } from "../@types/icon.js";
import { SizeLarge, SizeMedium, SizeSmall } from "../@types/size.js";
import {
    VariantDanger,
    VariantPopOut,
    VariantPrimary,
    VariantSecondary,
    VariantTertiary,
} from "../@types/variant.js";
import { bem } from "../@utils/bem.js";
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
    dataId?: string;
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
    dataId,
}: UiButtonProps) => {
    const iconSize = size === "small" ? 16 : 18;
    const hasIconBefore = !!iconBefore;
    const hasIconAfter = !!iconAfter;
    return (
        <button
            ref={buttonRef}
            className={b({ size, variant, isLoading, hasIconBefore, hasIconAfter })}
            disabled={isDisabled}
            tabIndex={0}
            onClick={onClick}
            data-id={dataId}
        >
            {iconBefore ? <UiIcon type={iconBefore} size={iconSize} /> : null}
            <span className={e("text")}>{label}</span>
            {iconAfter ? <UiIcon type={iconAfter} size={iconSize} /> : null}
        </button>
    );
};
