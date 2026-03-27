// (C) 2026 GoodData Corporation

import { forwardRef } from "react";

import cx from "classnames";

import { Button } from "@gooddata/sdk-ui-kit";

interface ISelectionTypeButtonProps {
    isOpen: boolean;
    title: string;
    toggleDropdown: () => void;
}

export const SelectionTypeButton = forwardRef<HTMLElement, ISelectionTypeButtonProps>(
    function SelectionTypeButton({ title, isOpen, toggleDropdown }, ref) {
        const buttonClassNames = cx(
            "gd-button-primary",
            "gd-button-small",
            "button-dropdown",
            "dropdown-button",
            "selection-kind-dropdown-button",
            "s-selection-kind-dropdown-button",
            {
                "is-active": isOpen,
            },
        );

        const iconRight = isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown";

        return (
            <Button
                ref={ref}
                className={buttonClassNames}
                title={title}
                value={title}
                onClick={toggleDropdown}
                iconRight={iconRight}
            />
        );
    },
);
