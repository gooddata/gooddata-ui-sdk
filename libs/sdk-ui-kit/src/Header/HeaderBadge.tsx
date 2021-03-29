// (C) 2021 GoodData Corporation
import React from "react";

/**
 * @internal
 */
export interface IHeaderBadgeProps {
    color?: string;
    backgroundColor?: string;
}

/**
 * @internal
 */
export const HeaderBadge: React.FC<IHeaderBadgeProps> = ({ children, color, backgroundColor }) => {
    return (
        <div className="gd-header-badge" style={{ color, backgroundColor }}>
            {children}
        </div>
    );
};
