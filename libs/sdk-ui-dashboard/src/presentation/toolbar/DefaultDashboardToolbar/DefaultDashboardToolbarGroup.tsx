// (C) 2022-2025 GoodData Corporation

import { type ReactNode } from "react";

/**
 * @internal
 */
export interface IDefaultDashboardToolbarGroupProps {
    title: string;
    children?: ReactNode;
}

/**
 * @internal
 */
export function DefaultDashboardToolbarGroup({ children, title }: IDefaultDashboardToolbarGroupProps) {
    return (
        <div className="gd-toolbar-group">
            <span className="gd-toolbar-group-title">{title}</span>
            {children}
        </div>
    );
}
