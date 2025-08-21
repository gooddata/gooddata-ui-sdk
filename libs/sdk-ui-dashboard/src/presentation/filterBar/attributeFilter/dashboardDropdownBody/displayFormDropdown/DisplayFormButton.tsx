// (C) 2021-2025 GoodData Corporation

import React from "react";

import classNames from "classnames";

import { Button } from "@gooddata/sdk-ui-kit";

export interface IToggleButtonProps {
    text: string;
    isOpened: boolean;
    toggleDropdown: (e: React.SyntheticEvent) => void;
}

export function DisplayFormButton({ isOpened, text: title, toggleDropdown }: IToggleButtonProps) {
    const buttonClassNames = classNames(
        "gd-button-primary",
        "gd-button-small",
        "button-dropdown",
        "dropdown-button",
        "attribute-display-form-button",
        "s-attribute-display-form-button",
        {
            "is-active": isOpened,
        },
    );
    const iconRight = isOpened ? "icon-navigateup" : "icon-navigatedown";
    return (
        <Button
            className={buttonClassNames}
            title={title}
            value={title}
            onClick={toggleDropdown}
            iconRight={iconRight}
        />
    );
}
