// (C) 2007-2022 GoodData Corporation
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
    disabled?: boolean;

    isOpen?: boolean;
    isSmall?: boolean;
    iconLeft?: string;

    onClick?: (e: React.MouseEvent) => void;
}

/**
 * @internal
 */
export const DropdownButton: React.FC<IDropdownButtonProps> = ({
    id,
    className,

    value,
    title = value,
    disabled,

    isOpen,
    isSmall = true,
    iconLeft,

    onClick,
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
            className={buttonClasses}
            value={value}
            iconLeft={iconLeft}
            iconRight={isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
            disabled={disabled}
            onClick={onClick}
        />
    );
};
