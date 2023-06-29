// (C) 2021 GoodData Corporation
import React from "react";

import { ILockedStatusProps } from "./types.js";
import {
    selectCanManageAnalyticalDashboard,
    selectSettings,
    useDashboardSelector,
} from "../../../../model/index.js";
import { LockedStatusIndicator } from "./LockedStatusIndicator.js";

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
