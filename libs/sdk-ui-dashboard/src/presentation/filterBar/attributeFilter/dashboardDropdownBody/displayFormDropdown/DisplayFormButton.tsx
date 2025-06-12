// (C) 2021 GoodData Corporation

import React from "react";
import classNames from "classnames";
import { Button } from "@gooddata/sdk-ui-kit";

export interface IToggleButtonProps {
    text: string;
    isOpened: boolean;
    toggleDropdown: (e: React.SyntheticEvent) => void;
}

export const DisplayFormButton: React.FC<IToggleButtonProps> = ({
    isOpened,
    text: title,
    toggleDropdown,
}) => {
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
};
