// (C) 2020 GoodData Corporation
import * as React from "react";
import classNames from "classnames";

interface IMeasureValueButtonProps {
    isActive: boolean;
    buttonTitle: string;
    onClick: () => void;
}

const DropdownButton = ({ isActive, buttonTitle, onClick }: IMeasureValueButtonProps) => {
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
            {buttonTitle}
        </button>
    );
};

export default DropdownButton;
