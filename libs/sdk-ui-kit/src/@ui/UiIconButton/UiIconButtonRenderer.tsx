// (C) 2025 GoodData Corporation

import React, { forwardRef } from "react";
import { stringUtils } from "@gooddata/util";

import { IconType } from "../@types/icon.js";
import { SizeLarge, SizeMedium, SizeSmall, SizeXLarge, SizeXSmall } from "../@types/size.js";
import {
    VariantDanger,
    VariantPopOut,
    VariantPrimary,
    VariantSecondary,
    VariantTable,
    VariantTertiary,
} from "../@types/variant.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { getButtonIconSize } from "../@utils/size.js";
import { IDropdownButtonRenderProps } from "../../Dropdown/Dropdown.js";
import { accessibilityConfigToAttributes } from "../../typings/utilities.js";

/**
 * @internal
 */
export interface UiIconButtonPublicProps {
    icon: IconType;
    label?: string;
    size?: SizeXSmall | SizeSmall | SizeMedium | SizeLarge | SizeXLarge;

    variant?:
        | VariantPrimary
        | VariantSecondary
        | VariantTertiary
        | VariantPopOut
        | VariantDanger
        | VariantTable;
    isDisabled?: boolean;
    isActive?: boolean;

    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
    dataId?: string;
    dataTestId?: string;
    ariaAttributes?: IDropdownButtonRenderProps["ariaAttributes"];
    accessibilityConfig?: IDropdownButtonRenderProps["accessibilityConfig"];
}

export interface UiIconButtonInternalProps {
    iconAfter?: IconType;
    iconAfterSize?: SizeXSmall | SizeSmall | SizeMedium | SizeLarge;
}

export type UiIconButtonRendererProps = UiIconButtonPublicProps & UiIconButtonInternalProps;

const { b } = bem("gd-ui-kit-icon-button");

export const UiIconButtonRenderer = forwardRef<HTMLButtonElement, UiIconButtonRendererProps>(
    (
        {
            icon,
            iconAfter,
            iconAfterSize = "xsmall",
            label,
            size = "medium",
            variant = "secondary",
            isDisabled,
            isActive,
            onClick,
            dataId,
            dataTestId,
            onKeyDown,
            ariaAttributes,
            accessibilityConfig,
        },
        ref,
    ) => {
        const iconSize = getButtonIconSize(size);
        const testId = dataTestId ? dataTestId : `${stringUtils.simplifyText(label)}`;
        return (
            <button
                ref={ref}
                className={b({
                    type: iconAfter ? "dropdownButton" : "button",
                    size,
                    variant,
                    active: isActive,
                })}
                disabled={isDisabled}
                onClick={onClick}
                onKeyDown={onKeyDown}
                data-id={dataId}
                data-testid={testId}
                aria-disabled={isDisabled}
                {...ariaAttributes}
                {...accessibilityConfigToAttributes(accessibilityConfig)}
            >
                <UiIcon type={icon} size={iconSize} ariaHidden />
                {iconAfter ? (
                    <UiIcon type={iconAfter} size={getButtonIconSize(iconAfterSize)} ariaHidden />
                ) : null}
            </button>
        );
    },
);

UiIconButtonRenderer.displayName = "UiIconButtonRenderer";
