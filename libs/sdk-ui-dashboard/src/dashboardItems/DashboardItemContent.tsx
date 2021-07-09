// (C) 2020 GoodData Corporation
import React, { forwardRef } from "react";
import cx from "classnames";

interface IDashboardItemContentProps {
    className?: string;
    children?: React.ReactNode;
}

export const DashboardItemContent = forwardRef<HTMLDivElement, IDashboardItemContentProps>(
    function DashboardItemContent({ children, className }, ref) {
        return (
            <div className={cx("dash-item-content", className)} ref={ref}>
                {children}
            </div>
        );
    },
);
