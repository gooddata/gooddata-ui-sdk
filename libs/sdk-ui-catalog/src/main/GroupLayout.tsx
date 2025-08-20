// (C) 2025 GoodData Corporation

import React from "react";

import cx from "classnames";

type Props = Omit<React.ComponentProps<"div">, "title"> & {
    title: React.ReactNode;
    children: React.ReactNode;
};

export function GroupLayout({ title, className, children, ...htmlProps }: Props) {
    return (
        <div {...htmlProps} className={cx("gd-analytics-catalog__main__group", className)}>
            <span className="gd-analytics-catalog__main__group__title">{title}</span>
            {children}
        </div>
    );
}
