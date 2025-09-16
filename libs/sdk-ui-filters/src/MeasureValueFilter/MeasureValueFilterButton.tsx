// (C) 2020-2025 GoodData Corporation

import { ReactElement } from "react";

import cx from "classnames";

interface IMeasureValueButtonProps {
    isActive: boolean;
    buttonTitle: string;
    onClick: () => void;
}

function DropdownButton({ isActive, buttonTitle, onClick }: IMeasureValueButtonProps): ReactElement {
    const className = cx(
        "gd-mvf-dropdown-button",
        "s-mvf-dropdown-button",
        "gd-button",
        "gd-button-secondary",
        "button-dropdown",
        "gd-icon-right",
        { "gd-icon-navigateup": isActive, "gd-icon-navigatedown": !isActive },
    );

    return (
        <button className={className} onClick={onClick}>
            {buttonTitle}
        </button>
    );
}

export default DropdownButton;
