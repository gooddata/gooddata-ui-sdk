// (C) 2022-2025 GoodData Corporation
import cx from "classnames";
import { Button } from "@gooddata/sdk-ui-kit";

interface ISelectionModeButtonProps {
    isOpen: boolean;
    title: string;
    toggleDropdown: () => void;
}

export function SelectionModeButton({ title, isOpen, toggleDropdown }: ISelectionModeButtonProps) {
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
}
