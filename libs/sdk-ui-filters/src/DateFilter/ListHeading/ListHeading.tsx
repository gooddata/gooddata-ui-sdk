// (C) 2007-2025 GoodData Corporation

import { ReactNode } from "react";

import cx from "classnames";

interface IListHeadingProps {
    className?: string;
    children: ReactNode;
}

export function ListHeading({ children, className, ...otherProps }: IListHeadingProps) {
    return (
        <div
            className={cx("gd-list-item gd-list-item-header gd-filter-list-heading", className)}
            {...otherProps}
        >
            {children}
        </div>
    );
}
