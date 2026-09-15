// (C) 2026 GoodData Corporation

import { type ReactNode, forwardRef } from "react";

import { simplifyText } from "@gooddata/util";

import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { bem } from "../@utils/bem.js";
import { type IUiToolbarItemBaseProps } from "../UiToolbar/toolbarItemProps.js";
import { UiToolbarItemTooltip } from "../UiToolbar/UiToolbarItemTooltip.js";

import { useToolbarItemRole } from "./useToolbarItemRole.js";

/**
 * @internal
 */
export interface IUiToolbarButtonProps extends IUiToolbarItemBaseProps {
    label: string;
    /**
     * Shown on hover and focus. Use it when the label is not self-explanatory.
     */
    tooltip?: ReactNode;
}

const { b, e } = bem("gd-ui-kit-toolbar-button");

/**
 * Label-only toolbar item.
 *
 * @internal
 */
export const UiToolbarButton = forwardRef<HTMLButtonElement, IUiToolbarButtonProps>(function UiToolbarButton(
    {
        label,
        value,
        isSelected,
        isDestructive = false,
        isDisabled,
        isActive = false,
        tooltip,
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
            className={b({ isSelected: isChecked, isDestructive, isActive })}
            {...accessibilityConfigToAttributes(accessibilityConfig)}
            data-id={dataId}
            data-testid={testId}
            {...buttonProps}
            {...ariaAttributes}
        >
            <span className={e("label")}>{label}</span>
        </button>
    );

    if (tooltip === undefined) {
        return button;
    }

    return (
        <UiToolbarItemTooltip content={tooltip} isDisabled={isActive}>
            {button}
        </UiToolbarItemTooltip>
    );
});
