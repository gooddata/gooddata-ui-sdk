// (C) 2007-2026 GoodData Corporation

import { type AriaAttributes, type MouseEvent, type MutableRefObject, type ReactNode } from "react";

import cx from "classnames";

import { Button } from "../Button/Button.js";
import { type IButtonAccessibilityConfig } from "../Button/index.js";
import { type IAccessibilityConfigBase } from "../typings/accessibility.js";

/**
 * @internal
 */
export interface IDropdownButtonProps {
    id?: string;
    className?: string;
    accessibilityConfig?: IAccessibilityConfigBase & { popupType?: AriaAttributes["aria-haspopup"] };

    value?: ReactNode;
    title?: string | ReactNode;
    disabled?: boolean;

    isOpen?: boolean;
    isSmall?: boolean;
    iconLeft?: string;
    isFullWidth?: boolean;

    onClick?: (e: MouseEvent) => void;

    children?: ReactNode;
    dropdownId?: string;
    buttonRef?: MutableRefObject<HTMLElement>;
}

/**
 * @internal
 */
export function DropdownButton({
    id,
    className,
    accessibilityConfig,

    value,
    title = value,
    disabled,

    isOpen,
    isSmall = true,
    iconLeft,
    isFullWidth = false,
    onClick,
    children,
    dropdownId,
    buttonRef,
}: IDropdownButtonProps) {
    const { ariaLabel, ariaLabelledBy, ariaDescribedBy, popupType, role, ariaExpanded, ariaControls } =
        accessibilityConfig ?? {};
    const effectiveAriaExpanded = ariaExpanded ?? isOpen ?? false;

    const buttonClasses = cx(
        "gd-button-primary",
        "button-dropdown",
        "dropdown-button",
        {
            "gd-button-small": isSmall,
            "is-dropdown-open": isOpen,
            "is-active": isOpen,
            "is-full-width": isFullWidth,
        },
        className,
    );

    const buttonAccessibilityConfig = (
        dropdownId
            ? {
                  isExpanded: isOpen,
                  popupId: dropdownId,
                  ariaLabel,
                  ariaLabelledBy,
                  ariaExpanded: effectiveAriaExpanded,
                  ariaDescribedBy,
                  ariaControls: ariaControls ?? (isOpen ? dropdownId : undefined),
                  role: role ?? "combobox",
                  popupType,
              }
            : {
                  ariaLabel,
                  ariaLabelledBy,
                  ariaDescribedBy,
                  role: role ?? "combobox",
              }
    ) satisfies IButtonAccessibilityConfig;

    return (
        <Button
            id={id}
            accessibilityConfig={buttonAccessibilityConfig}
            title={title && typeof title === "string" ? title : undefined}
            className={buttonClasses}
            value={value}
            iconLeft={iconLeft}
            iconRight={isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
            disabled={disabled}
            onClick={onClick}
            ref={buttonRef}
        >
            {children}
        </Button>
    );
}
