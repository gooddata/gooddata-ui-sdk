// (C) 2025-2026 GoodData Corporation

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
export interface IUiIconButtonPublicProps {
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
    /**
     * When `true` and `variant="tertiary"`, icon hover color uses the error palette color.
     */
    isDesctructive?: boolean;
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

export interface IUiIconButtonInternalProps {
    iconAfter?: IconType;
    iconAfterSize?: SizeXSmall | SizeSmall | SizeMedium | SizeLarge;
}

export type UiIconButtonRendererProps = IUiIconButtonPublicProps & IUiIconButtonInternalProps;

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
            isDesctructive,
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
                    destructive: variant === "tertiary" && (isDesctructive ?? false),
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
                <UiIcon type={icon} size={iconSize} color={iconColor} disableAnimation={disableAnimation} />
                {iconAfter ? <UiIcon type={iconAfter} size={getButtonIconSize(iconAfterSize)} /> : null}
            </button>
        );
    },
);

UiIconButtonRenderer.displayName = "UiIconButtonRenderer";
