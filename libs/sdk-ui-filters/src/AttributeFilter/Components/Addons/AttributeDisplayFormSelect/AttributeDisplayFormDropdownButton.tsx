// (C) 2021-2022 GoodData Corporation

import React from "react";
import classNames from "classnames";
import { useIntl } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export interface IAttributeDisplayFormDropdownButtonProps {
    text: string;
    isOpened: boolean;
    toggleDropdown: (e: React.SyntheticEvent) => void;
}

/**
 * @internal
 */
export const AttributeDisplayFormDropdownButton: React.FC<IAttributeDisplayFormDropdownButtonProps> = ({
    isOpened,
    text: title,
    toggleDropdown,
}) => {
    const intl = useIntl();

    const buttonClassNames = classNames(
        "gd-button-primary",
        "gd-button-small",
        "button-dropdown",
        "dropdown-button",
        "gd-attribute-filter-display-form-button",
        "s-attribute-display-form-button",
        {
            "is-active": isOpened,
        },
    );
    const iconRight = isOpened ? "gd-icon-navigateup" : "gd-icon-navigatedown";
    const buttonTitle = intl.formatMessage({ id: "attributesDropdown.display_as" }, { title });
    return (
        <Button
            className={buttonClassNames}
            title={buttonTitle}
            value={buttonTitle}
            onClick={toggleDropdown}
            iconRight={iconRight}
        />
    );
};
