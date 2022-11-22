// (C) 2022 GoodData Corporation
import React from "react";

/**
 * @internal
 */
export interface IDefaultDashboardToolbarGroupProps {
    title: string;
}

/**
 * @internal
 */
export const DefaultDashboardToolbarGroup: React.FC<IDefaultDashboardToolbarGroupProps> = (props) => {
    const { children, title } = props;
    return (
        <div className="gd-toolbar-group">
            <span className="gd-toolbar-group-title">{title}</span>
            {children}
        </div>
    );
};
