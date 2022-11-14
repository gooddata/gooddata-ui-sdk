// (C) 2022 GoodData Corporation
import React from "react";

import { DashboardToolbarButton } from "./DashboardToolbarButton";
import { IDashboardToolbarGroup } from "./types";

export const DashboardToolbarGroup: React.FC<IDashboardToolbarGroup> = (props) => {
    const { buttons, title } = props;
    return (
        <div className="gd-toolbar-group">
            <span className="gd-toolbar-group-title">{title}</span>
            {buttons.map((button) => (
                <DashboardToolbarButton key={button.id} {...button} />
            ))}
        </div>
    );
};
