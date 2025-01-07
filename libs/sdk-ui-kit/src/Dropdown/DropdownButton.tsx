// (C) 2007-2025 GoodData Corporation
import React, { ReactNode } from "react";
import cx from "classnames";
import { Button } from "../Button/Button.js";

/**
 * @internal
 */
export interface IDropdownButtonProps {
    id?: string;
    className?: string;

    value?: ReactNode;
    title?: string;
    ariaLabel?: string;
    disabled?: boolean;

    isOpen?: boolean;
    isSmall?: boolean;
    iconLeft?: string;

    onClick?: (e: React.MouseEvent) => void;

    children?: ReactNode;
}

/**
 * @internal
 */
export const DropdownButton: React.FC<IDropdownButtonProps> = ({
    id,
    className,

    value,
    title = value,
    ariaLabel,
    disabled,

    isOpen,
    isSmall = true,
    iconLeft,

    onClick,
    children,
}) => {
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

    return (
        <Button
            id={id}
            title={title && typeof title === "string" ? title : undefined}
            ariaLabel={ariaLabel}
            className={buttonClasses}
            value={value}
            iconLeft={iconLeft}
            iconRight={isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </Button>
    );
};
