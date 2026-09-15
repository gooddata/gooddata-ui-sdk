// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, type ReactNode, forwardRef } from "react";

import { simplifyText } from "@gooddata/util";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { bem } from "../@utils/bem.js";
import { type IUiDropdownButtonRenderProps } from "../UiDropdown/types.js";
import { UiToolbarChevron } from "../UiToolbar/UiToolbarChevron.js";
import { UiToolbarItemTooltip } from "../UiToolbar/UiToolbarItemTooltip.js";
import { useToolbarItemRole } from "../UiToolbarButton/useToolbarItemRole.js";

/**
 * @internal
 */
export interface IUiToolbarSelectProps {
    /**
     * The current selection, or the prompt when `isPlaceholder` is set.
     */
    label: string;
    /**
     * "fixed" is 240px wide and truncates the label so the toolbar does not move as the selection
     * changes.
     * @defaultValue "hug"
     */
    width?: "hug" | "fixed";
    /**
     * Nothing is chosen yet; the label reads as prompt text.
     * @defaultValue false
     */
    isPlaceholder?: boolean;
    /**
     * Held while the popup is on screen. Flips the chevron and keeps the pressed look.
     * @defaultValue false
     */
    isOpen?: boolean;
    isDisabled?: boolean;
    /**
     * Shown on hover and focus, for example the full name of a truncated label.
     */
    tooltip?: ReactNode;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
    id?: string;
    dataId?: string;
    dataTestId?: string;
    accessibilityConfig?: IAccessibilityConfigBase;
    /**
     * Attributes from the `renderButton` callback of {@link UiDropdown}. Without them the trigger
     * announces a listbox popup.
     */
    ariaAttributes?: IUiDropdownButtonRenderProps["ariaAttributes"];
}

const { b, e } = bem("gd-ui-kit-toolbar-select");

/**
 * Label-driven dropdown trigger of a toolbar.
 *
 * @internal
 */
export const UiToolbarSelect = forwardRef<HTMLButtonElement, IUiToolbarSelectProps>(function UiToolbarSelect(
    {
        label,
        width = "hug",
        isPlaceholder = false,
        isOpen = false,
        isDisabled,
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
    const { buttonProps } = useToolbarItemRole({ isDisabled, onClick, onKeyDown });
    const testId = dataTestId ?? simplifyText(label);

    const button = (
        <button
            ref={ref}
            id={id}
            type="button"
            className={b({ width, isPlaceholder, isActive: isOpen })}
            {...accessibilityConfigToAttributes(accessibilityConfig)}
            title={width === "fixed" && tooltip === undefined ? label : undefined}
            data-id={dataId}
            data-testid={testId}
            aria-haspopup={accessibilityConfig?.ariaHaspopup ?? "listbox"}
            aria-expanded={accessibilityConfig?.ariaExpanded ?? isOpen}
            {...buttonProps}
            {...ariaAttributes}
        >
            <span className={e("label")}>{label}</span>
            <UiToolbarChevron isOpen={isOpen} />
        </button>
    );

    if (tooltip === undefined) {
        return button;
    }

    return (
        <UiToolbarItemTooltip content={tooltip} isDisabled={isOpen}>
            {button}
        </UiToolbarItemTooltip>
    );
});
