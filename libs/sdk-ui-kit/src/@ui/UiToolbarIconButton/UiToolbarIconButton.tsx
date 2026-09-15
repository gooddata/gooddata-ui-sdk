// (C) 2026 GoodData Corporation

import { type ReactNode, forwardRef } from "react";

import { simplifyText } from "@gooddata/util";

import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { type IconType } from "../@types/icon.js";
import { type SizeMedium, type SizeSmall } from "../@types/size.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { type IUiToolbarItemBaseProps } from "../UiToolbar/toolbarItemProps.js";
import { UiToolbarItemTooltip } from "../UiToolbar/UiToolbarItemTooltip.js";
import { useToolbarItemRole } from "../UiToolbarButton/useToolbarItemRole.js";

const ICON_SIZE: Record<SizeSmall | SizeMedium, number> = {
    small: 14,
    medium: 20,
};

/**
 * @internal
 */
export interface IUiToolbarIconButtonProps extends IUiToolbarItemBaseProps {
    /**
     * Icon name, or a custom node such as {@link UiToolbarColorSwatch}.
     */
    icon: IconType | ReactNode;
    /**
     * Accessible name. It is also the tooltip text.
     */
    label: string;
    /**
     * "medium" is 28x28 with a 20px icon. "small" is 14x14 with a 14px icon and is meant for the
     * side controls of {@link UiToolbarStepper}.
     * @defaultValue "medium"
     */
    size?: SizeSmall | SizeMedium;
    /**
     * @defaultValue false
     */
    hideTooltip?: boolean;
}

const { b } = bem("gd-ui-kit-toolbar-icon-button");

/**
 * Icon-only toolbar item. It shows its label as a tooltip on hover and on keyboard focus.
 *
 * @internal
 */
export const UiToolbarIconButton = forwardRef<HTMLButtonElement, IUiToolbarIconButtonProps>(
    function UiToolbarIconButton(
        {
            icon,
            label,
            size = "medium",
            value,
            isSelected,
            isDestructive = false,
            isDisabled,
            isActive = false,
            hideTooltip = false,
            onClick,
            onKeyDown,
            id,
            dataId,
            dataTestId,
            accessibilityConfig,
            ariaAttributes,
        },
        ref,
    ) {
        const { isChecked, buttonProps } = useToolbarItemRole({
            value,
            isSelected,
            isDisabled,
            onClick,
            onKeyDown,
        });
        const testId = dataTestId ?? simplifyText(label);

        const button = (
            <button
                ref={ref}
                id={id}
                type="button"
                className={b({ size, isSelected: isChecked, isDestructive, isActive })}
                {...accessibilityConfigToAttributes(accessibilityConfig)}
                aria-label={accessibilityConfig?.ariaLabel ?? label}
                data-id={dataId}
                data-testid={testId}
                {...buttonProps}
                {...ariaAttributes}
            >
                {typeof icon === "string" ? (
                    <UiIcon type={icon as IconType} size={ICON_SIZE[size]} layout="block" />
                ) : (
                    icon
                )}
            </button>
        );

        if (hideTooltip) {
            return button;
        }

        return (
            <UiToolbarItemTooltip content={label} isDisabled={isActive}>
                {button}
            </UiToolbarItemTooltip>
        );
    },
);
