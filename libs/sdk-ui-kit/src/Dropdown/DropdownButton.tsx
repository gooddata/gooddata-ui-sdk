// (C) 2007-2025 GoodData Corporation
import React, { ReactNode } from "react";
import cx from "classnames";
import { Button } from "../Button/Button.js";
import { IAccessibilityConfigBase } from "../typings/accessibility.js";

/**
 * @internal
 */
export interface IDropdownButtonProps {
    id?: string;
    className?: string;
    accessibilityConfig?: IAccessibilityConfigBase;

    value?: ReactNode;
    title?: string;
    disabled?: boolean;

    isOpen?: boolean;
    isSmall?: boolean;
    iconLeft?: string;

    onClick?: (e: React.MouseEvent) => void;

    children?: ReactNode;
    dropdownId?: string;
    buttonRef?: React.MutableRefObject<HTMLElement>;
}

/**
 * @internal
 */
export const DropdownButton: React.FC<IDropdownButtonProps> = ({
    id,
    className,
    accessibilityConfig,

    value,
    title = value,
    disabled,

    isOpen,
    isSmall = true,
    iconLeft,

    onClick,
    children,
    dropdownId,
    buttonRef,
}) => {
    const { ariaLabel, ariaLabelledBy, ariaDescribedBy } = accessibilityConfig ?? {};

    const buttonClasses = cx(
        "gd-button-primary",
        "button-dropdown",
        "dropdown-button",
        {
            "gd-button-small": isSmall,
            "is-dropdown-open": isOpen,
            "is-active": isOpen,
        },
        className,
    );

    const buttonAccessibilityConfig = dropdownId
        ? {
              isExpanded: isOpen,
              popupId: dropdownId,
              ariaLabel,
              ariaLabelledBy,
              ariaDescribedBy,
              role: "combobox",
          }
        : {
              ariaLabel,
              ariaLabelledBy,
              role: "combobox",
          };

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
};
