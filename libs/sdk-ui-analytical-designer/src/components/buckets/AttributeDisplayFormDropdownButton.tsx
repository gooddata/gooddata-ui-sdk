// (C) 2021-2026 GoodData Corporation

import { type SyntheticEvent } from "react";

import classNames from "classnames";
import { useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

export interface IToggleButtonProps {
    text: string;
    isOpened: boolean;
    toggleDropdown: (e: SyntheticEvent) => void;
}

export type ToggleButtonProps = IToggleButtonProps;

export function AttributeDisplayFormButton({ isOpened, text: title, toggleDropdown }: ToggleButtonProps) {
    const intl = useIntl();

    const buttonClassNames = classNames(
        "gd-button-primary",
        "gd-button-small",
        "button-dropdown",
        "dropdown-button",
        "adi-attribute-display-form-button",
        "s-attribute-display-form-button",
        {
            "is-active": isOpened,
        },
    );
    const iconRight = isOpened ? "gd-icon-navigateup" : "gd-icon-navigatedown";
    const buttonTitle = intl.formatMessage({ id: "dashboard.bucket_item.display_form" }, { title });
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
