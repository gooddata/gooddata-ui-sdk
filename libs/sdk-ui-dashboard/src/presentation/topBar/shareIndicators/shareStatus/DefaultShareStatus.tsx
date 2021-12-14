// (C) 2021 GoodData Corporation
import React from "react";
import { IShareStatusProps } from "./types";
import {
    selectBackendCapabilities,
    selectCanManageAnalyticalDashboard,
    selectSettings,
    useDashboardSelector,
} from "../../../../model";
import { ShareStatusIndicator } from "./ShareStatusIndicator";

/**
 * @alpha
 */
export const DefaultShareStatus: React.FC<IShareStatusProps> = (props): JSX.Element | null => {
    const settings = useDashboardSelector(selectSettings);
    const capabilities = useDashboardSelector(selectBackendCapabilities);
    const canManageAnalyticalDashboard = useDashboardSelector(selectCanManageAnalyticalDashboard);
    if (
        !settings.enableAnalyticalDashboardPermissions ||
        !capabilities.supportsAccessControl ||
        !canManageAnalyticalDashboard
    ) {
        return null;
    }
    return <ShareStatusIndicator {...props} />;
};
