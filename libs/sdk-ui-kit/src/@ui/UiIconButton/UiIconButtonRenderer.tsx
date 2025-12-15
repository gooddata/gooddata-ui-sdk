// (C) 2025 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, forwardRef } from "react";

import { stringUtils } from "@gooddata/util";

import { type IDropdownButtonRenderProps } from "../../Dropdown/Dropdown.js";
import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { type IconType } from "../@types/icon.js";
import {
    type SizeLarge,
    type SizeMedium,
    type SizeSmall,
    type SizeXLarge,
    type SizeXSmall,
    type SizeXXLarge,
} from "../@types/size.js";
import { type ThemeColor } from "../@types/themeColors.js";
import {
    type VariantBare,
    type VariantDanger,
    type VariantPopOut,
    type VariantPrimary,
    type VariantSecondary,
    type VariantTable,
    type VariantTertiary,
} from "../@types/variant.js";
import { bem } from "../@utils/bem.js";
import { getButtonIconSize } from "../@utils/size.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

/**
 * @internal
 */
export interface UiIconButtonPublicProps {
    icon: IconType;
    iconColor?: ThemeColor;
    label?: string;
    size?: SizeXSmall | SizeSmall | SizeMedium | SizeLarge | SizeXLarge | SizeXXLarge;

    disableAnimation?: boolean;

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
            iconColor,
            iconAfter,
            iconAfterSize = "xsmall",
            disableAnimation,
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
        const testId = dataTestId || `${stringUtils.simplifyText(label ?? "")}`;
        return (
            <button
                ref={ref}
                className={b({
                    type: iconAfter ? "dropdownButton" : "button",
                    size,
                    variant,
                    active: isActive ?? false,
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
                <UiIcon
                    type={icon}
                    size={iconSize}
                    color={iconColor}
                    ariaHidden
                    disableAnimation={disableAnimation}
                />
                {iconAfter ? (
                    <UiIcon type={iconAfter} size={getButtonIconSize(iconAfterSize)} ariaHidden />
                ) : null}
            </button>
        );
    },
);

UiIconButtonRenderer.displayName = "UiIconButtonRenderer";
