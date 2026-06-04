// (C) 2020-2026 GoodData Corporation

import { type ReactElement, type ReactNode } from "react";

import cx from "classnames";

/**
 * Props passed to the MeasureValueFilter dropdown button (header) component.
 *
 * @beta
 */
export interface IMeasureValueFilterDropdownButtonProps {
    isActive: boolean;
    buttonTitle: string;
    buttonSubtitle?: string;
    buttonTitleExtension?: ReactNode;
    disabled?: boolean;
    onClick: () => void;
    /**
     * Id of the dropdown dialog this button opens. Wired to `aria-controls` while open.
     *
     * @beta
     */
    dropdownId?: string;
}

export function DropdownButton({
    isActive,
    buttonTitle,
    onClick,
    disabled,
    dropdownId,
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
        <button
            className={className}
            onClick={onClick}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={isActive}
            aria-controls={isActive ? dropdownId : undefined}
        >
            {buttonTitle}
        </button>
    );
}
