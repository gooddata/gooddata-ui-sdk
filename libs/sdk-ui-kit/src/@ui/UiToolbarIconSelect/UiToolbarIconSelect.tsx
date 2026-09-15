// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, type ReactNode, forwardRef } from "react";

import { simplifyText } from "@gooddata/util";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { accessibilityConfigToAttributes } from "../../typings/utilities.js";
import { type IconType } from "../@types/icon.js";
import { bem } from "../@utils/bem.js";
import { type IUiDropdownButtonRenderProps } from "../UiDropdown/types.js";
import { UiIcon } from "../UiIcon/UiIcon.js";
import { UiToolbarChevron } from "../UiToolbar/UiToolbarChevron.js";
import { UiToolbarItemTooltip } from "../UiToolbar/UiToolbarItemTooltip.js";
import { useToolbarItemRole } from "../UiToolbarButton/useToolbarItemRole.js";
import { UiToolbarColorSwatch } from "../UiToolbarColorSwatch/UiToolbarColorSwatch.js";

/**
 * @internal
 */
export interface IUiToolbarIconSelectProps {
    /**
     * Icon name, or a custom node such as {@link UiToolbarColorSwatch}.
     * @defaultValue a fill colour swatch
     */
    icon?: IconType | ReactNode;
    /**
     * Accessible name. It is also the tooltip text.
     */
    label: string;
    /**
     * Held while the popup is on screen. Flips the chevron and keeps the pressed look.
     * @defaultValue false
     */
    isOpen?: boolean;
    /**
     * What the trigger opens. Ignored when `ariaAttributes` are given.
     * @defaultValue "listbox"
     */
    popupType?: "listbox" | "menu" | "dialog";
    /**
     * Toggle state, exposed as `aria-pressed`.
     */
    isSelected?: boolean;
    isDisabled?: boolean;
    /**
     * @defaultValue false
     */
    hideTooltip?: boolean;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLButtonElement>) => void;
    id?: string;
    dataId?: string;
    dataTestId?: string;
    accessibilityConfig?: IAccessibilityConfigBase;
    /**
     * Attributes from the `renderButton` callback of {@link UiDropdown}.
     */
    ariaAttributes?: IUiDropdownButtonRenderProps["ariaAttributes"];
}

const { b } = bem("gd-ui-kit-toolbar-icon-select");

/**
 * Icon-driven dropdown trigger of a toolbar: a colour picker, a style menu, a list.
 *
 * @internal
 */
export const UiToolbarIconSelect = forwardRef<HTMLButtonElement, IUiToolbarIconSelectProps>(
    function UiToolbarIconSelect(
        {
            icon = <UiToolbarColorSwatch variant="fill" />,
            label,
            isOpen = false,
            popupType = "listbox",
            isSelected,
            isDisabled,
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
        const { isChecked, buttonProps } = useToolbarItemRole({ isSelected, isDisabled, onClick, onKeyDown });
        const testId = dataTestId ?? simplifyText(label);

        const button = (
            <button
                ref={ref}
                id={id}
                type="button"
                className={b({ isSelected: isChecked, isActive: isOpen })}
                {...accessibilityConfigToAttributes(accessibilityConfig)}
                aria-label={accessibilityConfig?.ariaLabel ?? label}
                aria-haspopup={accessibilityConfig?.ariaHaspopup ?? popupType}
                aria-expanded={accessibilityConfig?.ariaExpanded ?? isOpen}
                data-id={dataId}
                data-testid={testId}
                {...buttonProps}
                {...ariaAttributes}
            >
                {typeof icon === "string" ? (
                    <UiIcon type={icon as IconType} size={20} layout="block" />
                ) : (
                    icon
                )}
                <UiToolbarChevron isOpen={isOpen} />
            </button>
        );

        if (hideTooltip) {
            return button;
        }

        return (
            <UiToolbarItemTooltip content={label} isDisabled={isOpen}>
                {button}
            </UiToolbarItemTooltip>
        );
    },
);
