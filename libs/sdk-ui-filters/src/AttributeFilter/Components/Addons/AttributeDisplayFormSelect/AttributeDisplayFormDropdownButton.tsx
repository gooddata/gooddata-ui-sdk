// (C) 2021-2025 GoodData Corporation

import { SyntheticEvent } from "react";
import classNames from "classnames";
import { useIntl } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export interface IAttributeDisplayFormDropdownButtonProps {
    text: string;
    isOpened: boolean;
    toggleDropdown: (e: SyntheticEvent) => void;
}

/**
 * @internal
 */
export function AttributeDisplayFormDropdownButton({
    isOpened,
    text: title,
    toggleDropdown,
}: IAttributeDisplayFormDropdownButtonProps) {
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
}
