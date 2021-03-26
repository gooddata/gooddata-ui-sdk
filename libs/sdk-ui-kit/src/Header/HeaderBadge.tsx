// (C) 2021 GoodData Corporation
import React from "react";
import cx from "classnames";

/**
 * @internal
 */
export interface IHeaderBadgeProps {
    className?: string;
    color?: string;
    backgroundColor?: string;
}

/**
 * @internal
 */
export const HeaderBadge: React.FC<IHeaderBadgeProps> = ({ children, color, backgroundColor, className }) => {
    return (
        <div className={cx("gd-header-badge", className)} style={{ color, backgroundColor }}>
            {children}
        </div>
    );
};
