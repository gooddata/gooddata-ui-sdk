// (C) 2007-2025 GoodData Corporation
import { ReactNode } from "react";
import cx from "classnames";

interface ISelectOptionProps {
    isFocused: boolean;
    isSelected: boolean;
    className?: string;
    children: ReactNode;
}

export function SelectOption({
    isFocused,
    isSelected,
    className,
    children,
    ...restProps
}: ISelectOptionProps) {
    return (
        <div
            className={cx(
                "gd-list-item",
                "gd-select-option",
                isSelected && "gd-select-option-is-selected",
                isFocused && "gd-select-option-is-focused s-select-item-focused",
                className,
            )}
            {...restProps}
        >
            {children}
        </div>
    );
}
