// (C) 2019-2025 GoodData Corporation

import { HTMLProps } from "react";

import cx from "classnames";

export function VisibleScrollbar({ className, children, ...restProps }: HTMLProps<HTMLDivElement>) {
    return (
        <div className={cx("gd-visible-scrollbar", className)} {...restProps}>
            {children}
        </div>
    );
}
