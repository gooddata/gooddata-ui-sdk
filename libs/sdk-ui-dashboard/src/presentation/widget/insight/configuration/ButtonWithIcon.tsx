// (C) 2020-2025 GoodData Corporation

import { DropdownButton } from "@gooddata/sdk-ui-kit";

export interface IButtonWithTypeIcon {
    icon?: string;
    value: string;
    className?: string;
    isOpen: boolean;
    disabled: boolean;
    onClick: () => void;
}

export function ButtonWithIcon(props: IButtonWithTypeIcon) {
    return (
        <DropdownButton
            value={props.value}
            isSmall={false}
            disabled={props.disabled}
            className={`gd-button-small ${props.className}`}
            iconLeft={props.icon}
            isOpen={props.isOpen}
            onClick={props.onClick}
        />
    );
}
