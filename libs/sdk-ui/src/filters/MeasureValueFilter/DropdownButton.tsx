// (C) 2019 GoodData Corporation
import * as React from "react";
import classNames from "classnames";

import { IDropdownButtonProps } from "./Dropdown";

export class DropdownButton extends React.PureComponent<IDropdownButtonProps> {
    public render() {
        const { isActive, measureTitle, onClick } = this.props;

        const className = classNames(
            "gd-mvf-dropdown-button",
            "s-mvf-dropdown-button",
            "gd-button",
            "gd-button-secondary",
            "button-dropdown",
            "icon-right",
            { "icon-navigateup": isActive, "icon-navigatedown": !isActive },
        );

        return (
            <button className={className} onClick={onClick}>
                {measureTitle}
            </button>
        );
    }
}
