// (C) 2007-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

interface ISelectHeading {
    children: React.ReactNode;
    className?: string;
    key?: string;
    style?: React.CSSProperties;
}

export function SelectHeading({ children, className, ...otherProps }: ISelectHeading) {
    return (
        <div className={cx("gd-select-heading gd-list-item gd-list-item-header", className)} {...otherProps}>
            {children}
        </div>
    );
}
