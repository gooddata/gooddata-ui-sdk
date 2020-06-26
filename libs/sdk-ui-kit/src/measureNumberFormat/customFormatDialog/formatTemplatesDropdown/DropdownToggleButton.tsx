// (C) 2020 GoodData Corporation
import * as React from "react";
import { FormattedMessage } from "react-intl";
import classNames from "classnames";

interface IDropdownToggleButtonProps {
    isOpened: boolean;
    toggleDropdown: () => void;
}

const DropdownToggleButton = ({ toggleDropdown, isOpened }: IDropdownToggleButtonProps) => (
    <div
        className="gd-measure-format-button gd-measure-format-button-templates s-measure-format-templates-toggle-button"
        onClick={toggleDropdown}
    >
        <span>
            <FormattedMessage id="measureNumberCustomFormatDialog.template.title" />
        </span>
        <div
            className={classNames(
                "gd-measure-format-button-icon-right",
                isOpened ? "icon-navigateup" : "icon-navigatedown",
            )}
        />
    </div>
);

export default DropdownToggleButton;
