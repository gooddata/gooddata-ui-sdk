// (C) 2020-2025 GoodData Corporation

import { type ReactElement } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

interface IDropdownToggleButtonProps {
    isOpened: boolean;
    toggleDropdown: () => void;
}

export function DropdownToggleButton({ toggleDropdown, isOpened }: IDropdownToggleButtonProps): ReactElement {
    return (
        <div
            className="gd-measure-format-button gd-measure-format-button-templates s-measure-format-templates-toggle-button"
            onClick={toggleDropdown}
        >
            <span>
                <FormattedMessage id="measureNumberCustomFormatDialog.template.title" />
            </span>
            <div
                className={cx(
                    "gd-measure-format-button-icon-right",
                    isOpened ? "gd-icon-navigateup" : "gd-icon-navigatedown",
                )}
            />
        </div>
    );
}
