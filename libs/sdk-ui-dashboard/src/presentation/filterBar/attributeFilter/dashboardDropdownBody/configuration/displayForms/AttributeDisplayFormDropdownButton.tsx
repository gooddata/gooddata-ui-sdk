// (C) 2022-2025 GoodData Corporation

import { type SyntheticEvent } from "react";

import cx from "classnames";

import { Button } from "@gooddata/sdk-ui-kit";

interface IAttributeDisplayFormDropdownButtonProps {
    title: string;
    isOpened: boolean;
    toggleDropdown: (e: SyntheticEvent) => void;
}

export function AttributeDisplayFormDropdownButton({
    title,
    isOpened,
    toggleDropdown,
}: IAttributeDisplayFormDropdownButtonProps) {
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
}
