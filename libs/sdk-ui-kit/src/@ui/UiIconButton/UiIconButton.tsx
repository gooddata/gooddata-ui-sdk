// (C) 2024-2025 GoodData Corporation

import React, { forwardRef } from "react";
import { IconType } from "../@types/icon.js";
import { SizeLarge, SizeMedium, SizeSmall, SizeXSmall } from "../@types/size.js";
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
    size?: SizeXSmall | SizeSmall | SizeMedium | SizeLarge;
    variant?: VariantPrimary | VariantSecondary | VariantTertiary | VariantPopOut | VariantDanger;
    isDisabled?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    dataId?: string;
}

const { b } = bem("gd-ui-kit-icon-button");

const getSize = (size: SizeXSmall | SizeSmall | SizeMedium | SizeLarge) => {
    if (size === "xsmall") {
        return 12;
    }
    return size === "small" ? 16 : 18;
};

/**
 * @internal
 */
export const UiIconButton = forwardRef<HTMLButtonElement, UiIconButtonProps>(
    ({ icon, label, size = "medium", variant = "secondary", isDisabled, onClick, dataId }, ref) => {
        const iconSize = getSize(size);

        const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (isDisabled) {
                e.preventDefault();
                return;
            }
            onClick?.(e);
        };

        return (
            <button
                ref={ref}
                aria-label={label}
                className={b({ size, variant })}
                aria-disabled={isDisabled}
                onClick={onClickHandler}
                data-id={dataId}
            >
                <UiIcon type={icon} size={iconSize} ariaHidden />
            </button>
        );
    },
);

UiIconButton.displayName = "UiIconButton";
