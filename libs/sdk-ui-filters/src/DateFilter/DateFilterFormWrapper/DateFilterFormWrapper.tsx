// (C) 2007-2019 GoodData Corporation
import React from "react";
import cx from "classnames";

interface IDateFilterFormWrapperProps {
    children: React.ReactNode;
    isMobile: boolean;
}

export const DateFilterFormWrapper: React.FC<
    IDateFilterFormWrapperProps & React.HTMLProps<HTMLDivElement>
> = ({ children, isMobile, className, ...restProps }) => (
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
