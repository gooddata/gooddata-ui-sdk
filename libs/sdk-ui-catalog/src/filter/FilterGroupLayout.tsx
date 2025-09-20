// (C) 2025 GoodData Corporation

import type { ComponentProps, ReactNode } from "react";

import cx from "classnames";

type Props = Omit<ComponentProps<"div">, "title"> & {
    title: ReactNode;
    children: ReactNode;
};

export function FilterGroupLayout({ title, className, children, ...htmlProps }: Props) {
    return (
        <div {...htmlProps} className={cx("gd-analytics-catalog__filter__group", className)}>
            <span className="gd-analytics-catalog__filter__group__title">{title}</span>
            {children}
        </div>
    );
}
