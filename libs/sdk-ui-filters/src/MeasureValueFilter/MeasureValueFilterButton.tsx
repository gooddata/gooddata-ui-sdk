// (C) 2020-2026 GoodData Corporation

import { type ReactElement } from "react";

import cx from "classnames";

/**
 * Props passed to the MeasureValueFilter dropdown button (header) component.
 *
 * @beta
 */
export interface IMeasureValueFilterDropdownButtonProps {
    isActive: boolean;
    buttonTitle: string;
    onClick: () => void;
}

export function DropdownButton({
    isActive,
    buttonTitle,
    onClick,
}: IMeasureValueFilterDropdownButtonProps): ReactElement {
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
