// (C) 2007-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

interface IDateFilterFormWrapperProps {
    children: React.ReactNode;
    isMobile: boolean;
}

export function DateFilterFormWrapper({
    children,
    isMobile,
    className,
    ...restProps
}: IDateFilterFormWrapperProps & React.HTMLProps<HTMLDivElement>) {
    return (
        <div
            className={cx(
                className,
                "gd-date-filter-form-wrapper",
                !isMobile && "gd-date-filter-form-wrapper-desktop",
            )}
            {...restProps}
        >
            <div className="gd-date-filter-form-wrapper-inner">{children}</div>
        </div>
    );
}
