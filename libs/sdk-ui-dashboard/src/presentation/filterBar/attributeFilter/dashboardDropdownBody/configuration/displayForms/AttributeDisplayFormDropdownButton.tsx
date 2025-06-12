// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { Button } from "@gooddata/sdk-ui-kit";

interface IAttributeDisplayFormDropdownButtonProps {
    title: string;
    isOpened: boolean;
    toggleDropdown: (e: React.SyntheticEvent) => void;
}

export const AttributeDisplayFormDropdownButton: React.FC<IAttributeDisplayFormDropdownButtonProps> = ({
    title,
    isOpened,
    toggleDropdown,
}) => {
    const buttonClassNames = cx(
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
    const iconRight = isOpened ? "gd-icon-navigateup" : "gd-icon-navigatedown";
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
