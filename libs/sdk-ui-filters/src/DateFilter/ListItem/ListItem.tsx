// (C) 2007-2019 GoodData Corporation
import React from "react";
import cx from "classnames";

export const ListItem: React.FC<{ isSelected?: boolean } & React.HTMLProps<HTMLButtonElement>> = ({
    isSelected: isActive,
    className,
    children,
    ...restProps
}) => (
    <button
        className={cx(
            "gd-list-item",
            "gd-filter-list-item",
            {
                "is-selected": isActive,
                "gd-filter-list-item-selected": isActive,
            },
            className,
        )}
        {...(restProps as any)}
    >
        {children}
    </button>
);
