// (C) 2022-2023 GoodData Corporation
import cx from "classnames";
import { Button } from "@gooddata/sdk-ui-kit";
import React from "react";

interface ISelectionModeButtonProps {
    isOpen: boolean;
    title: string;
    toggleDropdown: () => void;
}

export const SelectionModeButton: React.FC<ISelectionModeButtonProps> = (props) => {
    const { title, isOpen, toggleDropdown } = props;

    const buttonClassNames = cx(
        "gd-button-primary",
        "gd-button-small",
        "button-dropdown",
        "dropdown-button",
        "selection-mode-dropdown-button",
        "s-selection-mode-dropdown-button",
        {
            "is-active": isOpen,
        },
    );

    const iconRight = isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown";

    return (
        <Button
            className={buttonClassNames}
            title={title}
            value={title}
            onClick={toggleDropdown}
            iconRight={iconRight}
        />
    );
};
