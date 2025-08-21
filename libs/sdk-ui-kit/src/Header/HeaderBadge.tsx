// (C) 2021-2025 GoodData Corporation
import React from "react";

/**
 * @internal
 */
export interface IHeaderBadgeProps {
    color?: string;
    backgroundColor?: string;
    children?: React.ReactNode;
}

/**
 * @internal
 */
export function HeaderBadge({ children, color, backgroundColor }: IHeaderBadgeProps) {
    return (
        <div className="gd-header-badge" style={{ color, backgroundColor }}>
            {children}
        </div>
    );
}
