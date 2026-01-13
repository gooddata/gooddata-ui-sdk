// (C) 2025-2026 GoodData Corporation

import type { ComponentProps, ReactNode } from "react";

import cx from "classnames";

type Props = Omit<ComponentProps<"div">, "title"> & {
    title: ReactNode;
    titleId?: string;
    children: ReactNode;
};

export function FilterGroupLayout({ title, titleId, className, children, ...htmlProps }: Props) {
    return (
        <div {...htmlProps} className={cx("gd-analytics-catalog__filter__group", className)}>
            <span id={titleId} className="gd-analytics-catalog__filter__group__title">
                {title}
            </span>
            {children}
        </div>
    );
}
