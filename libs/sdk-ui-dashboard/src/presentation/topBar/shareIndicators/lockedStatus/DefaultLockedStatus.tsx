// (C) 2021-2025 GoodData Corporation
import React, { ReactElement } from "react";

import { LockedStatusIndicator } from "./LockedStatusIndicator.js";
import { ILockedStatusProps } from "./types.js";
import {
    selectCanManageAnalyticalDashboard,
    selectSettings,
    useDashboardSelector,
} from "../../../../model/index.js";

/**
 * @alpha
 */

export const DefaultLockedStatus: React.FC<ILockedStatusProps> = (props): ReactElement | null => {
    const settings = useDashboardSelector(selectSettings);
    const canManageAnalyticalDashboard = useDashboardSelector(selectCanManageAnalyticalDashboard);
    if (!settings.enableNewAnalyticalDashboardsNavigation || !canManageAnalyticalDashboard) {
        return null;
    }
    return <LockedStatusIndicator {...props} />;
};
