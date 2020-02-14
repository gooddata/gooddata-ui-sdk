// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import cx from "classnames";

interface IListHeadingProps {
    className?: string;
    children: React.ReactNode;
}

export const ListHeading: React.FC<IListHeadingProps> = ({ children, className, ...otherProps }) => (
    <div className={cx("gd-list-item gd-list-item-header gd-filter-list-heading", className)} {...otherProps}>
        {children}
    </div>
);
