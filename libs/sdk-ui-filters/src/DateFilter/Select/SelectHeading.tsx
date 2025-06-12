// (C) 2007-2019 GoodData Corporation
import React from "react";
import cx from "classnames";

interface ISelectHeading {
    children: React.ReactNode;
    className?: string;
    key?: string;
    style?: React.CSSProperties;
}

export const SelectHeading: React.FC<ISelectHeading> = ({ children, className, ...otherProps }) => (
    <div className={cx("gd-select-heading gd-list-item gd-list-item-header", className)} {...otherProps}>
        {children}
    </div>
);
