// (C) 2021 GoodData Corporation
import { IWidgetAlert } from "@gooddata/sdk-backend-spi";
import { DashboardContext } from "../../../types/commonTypes";

export function loadDashboardAlerts(ctx: DashboardContext): Promise<IWidgetAlert[]> {
    const { backend, workspace, dashboardRef } = ctx;

    // no need to load anything if the backend does not support setting the alerts in the first place
    if (!backend.capabilities.supportsKpiWidget) {
        return Promise.resolve([]);
    }

    return backend.workspace(workspace).dashboards().getDashboardWidgetAlertsForCurrentUser(dashboardRef!);
}
