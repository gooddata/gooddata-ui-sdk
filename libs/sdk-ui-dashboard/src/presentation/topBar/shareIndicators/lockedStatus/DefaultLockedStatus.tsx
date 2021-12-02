// (C) 2021 GoodData Corporation
import React from "react";

import { ILockedStatusProps } from "./types";
import { selectCanManageAnalyticalDashboard, selectSettings, useDashboardSelector } from "../../../../model";
import { LockedStatusIndicator } from "./LockedStatusIndicator";

/**
 * @alpha
 */

export const DefaultLockedStatus: React.FC<ILockedStatusProps> = (props): JSX.Element | null => {
    const settings = useDashboardSelector(selectSettings);
    const canManageAnalyticalDashboard = useDashboardSelector(selectCanManageAnalyticalDashboard);
    if (!settings.enableNewAnalyticalDashboardsNavigation || !canManageAnalyticalDashboard) {
        return null;
    }
    return <LockedStatusIndicator {...props} />;
};
