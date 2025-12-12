// (C) 2007-2025 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";

interface IListHeadingProps {
    id?: string;
    className?: string;
    children: ReactNode;
}

export function ListHeading({ children, className, id, ...otherProps }: IListHeadingProps) {
    return (
        <div
            role="presentation"
            id={id}
            className={cx("gd-list-item gd-list-item-header gd-filter-list-heading", className)}
            {...otherProps}
        >
            {children}
        </div>
    );
}
