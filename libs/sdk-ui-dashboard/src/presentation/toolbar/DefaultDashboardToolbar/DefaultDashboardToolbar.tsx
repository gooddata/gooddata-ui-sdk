// (C) 2022-2025 GoodData Corporation
import { CustomToolbarComponent } from "../types.js";

/**
 * @internal
 */
export const DefaultDashboardToolbar: CustomToolbarComponent = ({ children }) => {
    return <div className="gd-dashboard-toolbar s-dashboard-toolbar">{children}</div>;
};
