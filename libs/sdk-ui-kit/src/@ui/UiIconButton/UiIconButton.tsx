// (C) 2024-2025 GoodData Corporation

import React, { forwardRef } from "react";
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
export interface UiIconButtonProps {
    icon: IconType;
    label: string;
    size?: SizeSmall | SizeMedium | SizeLarge;
    variant?: VariantPrimary | VariantSecondary | VariantTertiary | VariantPopOut | VariantDanger;
    isDisabled?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    dataId?: string;
}

const { b } = bem("gd-ui-kit-icon-button");

/**
 * @internal
 */
export const UiIconButton = forwardRef<HTMLButtonElement, UiIconButtonProps>(
    ({ icon, label, size = "medium", variant = "secondary", isDisabled, onClick, dataId }, ref) => {
        const iconSize = size === "small" ? 16 : 18;
        return (
            <button
                ref={ref}
                aria-label={label}
                className={b({ size, variant })}
                disabled={isDisabled}
                onClick={onClick}
                data-id={dataId}
            >
                <UiIcon type={icon} size={iconSize} ariaHidden />
            </button>
        );
    },
);

UiIconButton.displayName = "UiIconButton";
