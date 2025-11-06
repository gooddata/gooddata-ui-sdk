// (C) 2025 GoodData Corporation

import { KeyboardEvent, MouseEvent, forwardRef } from "react";

import { stringUtils } from "@gooddata/util";

import { IDropdownButtonRenderProps } from "../../Dropdown/Dropdown.js";
import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { IconType } from "../@types/icon.js";
import { SizeLarge, SizeMedium, SizeSmall, SizeXLarge, SizeXSmall, SizeXXLarge } from "../@types/size.js";
import {
    VariantBare,
    VariantDanger,
    VariantPopOut,
    VariantPrimary,
    VariantSecondary,
    VariantTable,
    VariantTertiary,
} from "../@types/variant.js";
import { bem } from "../@utils/bem.js";
import { getButtonIconSize } from "../@utils/size.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

/**
 * @internal
 */
export interface UiIconButtonPublicProps {
    icon: IconType;
    label?: string;
    size?: SizeXSmall | SizeSmall | SizeMedium | SizeLarge | SizeXLarge | SizeXXLarge;

    variant?:
        | VariantPrimary
        | VariantSecondary
        | VariantTertiary
        | VariantPopOut
        | VariantDanger
        | VariantTable
        | VariantBare;
    isDisabled?: boolean;
    isActive?: boolean;

    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
    dataId?: string;
    dataTestId?: string;
    ariaAttributes?: IDropdownButtonRenderProps["ariaAttributes"];
    accessibilityConfig?: IDropdownButtonRenderProps["accessibilityConfig"];
    tabIndex?: number;
    id?: string;
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
            tabIndex,
            id,
        },
        ref,
    ) => {
        const iconSize = getButtonIconSize(size);
        const testId = dataTestId || `${stringUtils.simplifyText(label)}`;
        return (
            <button
                ref={ref}
                className={b({
                    type: iconAfter ? "dropdownButton" : "button",
                    size,
                    variant,
                    active: isActive,
                })}
                id={id}
                disabled={isDisabled}
                onClick={onClick}
                onKeyDown={onKeyDown}
                data-id={dataId}
                data-testid={testId}
                aria-disabled={isDisabled}
                aria-label={label}
                tabIndex={tabIndex}
                {...accessibilityConfigToAttributes(accessibilityConfig)}
                {...ariaAttributes}
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
