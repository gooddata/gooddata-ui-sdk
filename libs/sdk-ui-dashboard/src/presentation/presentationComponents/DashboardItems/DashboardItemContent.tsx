// (C) 2020-2022 GoodData Corporation
import React, { forwardRef, useCallback } from "react";
import cx from "classnames";

interface IDashboardItemContentProps {
    className?: string;
    children?: React.ReactNode;
    isSelectable?: boolean;
    isSelected?: boolean;
    onSelected?: () => void;
}

export const DashboardItemContent = forwardRef<HTMLDivElement, IDashboardItemContentProps>(
    function DashboardItemContent({ children, className, isSelectable, isSelected, onSelected }, ref) {
        const handleClick = useCallback(
            (e: React.MouseEvent) => {
                if (onSelected) {
                    e.stopPropagation();
                    onSelected();
                }
            },
            [onSelected],
        );
        return (
            <div
                className={cx("dash-item-content", className, {
                    "is-selectable": isSelectable,
                    "is-selected": isSelected,
                })}
                ref={ref}
                onClick={handleClick}
            >
                {children}
            </div>
        );
    },
);
