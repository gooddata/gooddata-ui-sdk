// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { ShareStatusIndicator } from "./ShareStatusIndicator.js";
import { type IShareStatusProps } from "./types.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectSupportsAccessControlCapability } from "../../../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import { selectCanManageAnalyticalDashboard } from "../../../../model/store/permissions/permissionsSelectors.js";

/**
 * @alpha
 */
export function DefaultShareStatus(props: IShareStatusProps): ReactElement | null {
    const supportsAccessControl = useDashboardSelector(selectSupportsAccessControlCapability);
    const canManageAnalyticalDashboard = useDashboardSelector(selectCanManageAnalyticalDashboard);
    if (!supportsAccessControl || !canManageAnalyticalDashboard) {
        return null;
    }
    return <ShareStatusIndicator {...props} />;
}
