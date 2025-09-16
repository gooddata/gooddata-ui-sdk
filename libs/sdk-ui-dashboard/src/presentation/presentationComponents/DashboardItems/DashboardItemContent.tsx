// (C) 2020-2025 GoodData Corporation

import { MouseEvent, ReactNode, forwardRef } from "react";

import cx from "classnames";

interface IDashboardItemContentProps {
    className?: string;
    children?: ReactNode;
    isSelectable?: boolean;
    isSelected?: boolean;
    isExport?: boolean;
    onSelected?: (e?: MouseEvent) => void;
    onEnter?: () => void;
    onLeave?: () => void;
}

export const DashboardItemContent = forwardRef<HTMLDivElement, IDashboardItemContentProps>(
    function DashboardItemContent(
        { children, className, isSelectable, isSelected, isExport, onSelected, onEnter, onLeave },
        ref,
    ) {
        return (
            <div
                className={cx("dash-item-content", className, {
                    "is-selectable": isSelectable,
                    "is-selected": isSelected,
                    "is-export": isExport,
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
