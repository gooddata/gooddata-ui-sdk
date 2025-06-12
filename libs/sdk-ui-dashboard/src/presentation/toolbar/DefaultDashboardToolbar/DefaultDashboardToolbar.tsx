// (C) 2022 GoodData Corporation
import React from "react";
import { CustomToolbarComponent } from "../types.js";

/**
 * @internal
 */
export const DefaultDashboardToolbar: CustomToolbarComponent = (props) => {
    const { children } = props;
    return <div className="gd-dashboard-toolbar s-dashboard-toolbar">{children}</div>;
};
