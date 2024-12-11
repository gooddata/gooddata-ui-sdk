// (C) 2020-2024 GoodData Corporation
import React, { forwardRef, MouseEvent } from "react";
import cx from "classnames";

interface IDashboardItemContentProps {
    className?: string;
    children?: React.ReactNode;
    isSelectable?: boolean;
    isSelected?: boolean;
    onSelected?: (e?: MouseEvent) => void;
    onEnter?: () => void;
    onLeave?: () => void;
}

export const DashboardItemContent = forwardRef<HTMLDivElement, IDashboardItemContentProps>(
    function DashboardItemContent(
        { children, className, isSelectable, isSelected, onSelected, onEnter, onLeave },
        ref,
    ) {
        return (
            <div
                className={cx("dash-item-content", className, {
                    "is-selectable": isSelectable,
                    "is-selected": isSelected,
                })}
                ref={ref}
                onClick={onSelected}
                onMouseOver={onEnter}
                onMouseOut={onLeave}
            >
                {children}
            </div>
        );
    },
);
