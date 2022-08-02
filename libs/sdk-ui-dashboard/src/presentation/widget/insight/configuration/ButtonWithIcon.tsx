// (C) 2020-2022 GoodData Corporation
import React from "react";
import { DropdownButton } from "@gooddata/sdk-ui-kit";

export interface IButtonWithTypeIcon {
    icon: string;
    value: string;
    className?: string;
    isOpen: boolean;
    onClick: () => void;
}

export const ButtonWithIcon = (props: IButtonWithTypeIcon) => {
    return (
        <DropdownButton
            value={props.value}
            isSmall={false}
            className={`gd-button-small ${props.className}`}
            iconLeft={props.icon}
            isOpen={props.isOpen}
            onClick={props.onClick}
        />
    );
};
