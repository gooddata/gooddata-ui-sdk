// (C) 2022 GoodData Corporation
import React from "react";
import { DashboardToolbarGroup } from "./DashboardToolbarGroup";
import { IDashboardToolbarGroup } from "./types";

/**
 * @internal
 */
export interface IDashboardToolbarProps {
    groups: IDashboardToolbarGroup[];
}

/**
 * @internal
 */
export const DashboardToolbar: React.FC<IDashboardToolbarProps> = (props) => {
    const { groups } = props;
    return (
        <div className="gd-dashboard-toolbar s-dashboard-toolbar">
            {groups.map((group) => (
                <DashboardToolbarGroup key={group.title} {...group} />
            ))}
        </div>
    );
};
