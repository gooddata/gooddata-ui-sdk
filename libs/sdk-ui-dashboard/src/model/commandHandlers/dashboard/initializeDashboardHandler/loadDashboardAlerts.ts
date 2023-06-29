// (C) 2021-2022 GoodData Corporation
import { IWidgetAlert } from "@gooddata/sdk-model";
import { DashboardContext } from "../../../types/commonTypes.js";

export function loadDashboardAlerts(ctx: DashboardContext): Promise<IWidgetAlert[]> {
    const { backend, workspace, dashboardRef } = ctx;

    // no need to load anything if the backend does not support setting the alerts in the first place
    if (!backend.capabilities.supportsKpiWidget) {
        return Promise.resolve([]);
    }

    return backend.workspace(workspace).dashboards().getDashboardWidgetAlertsForCurrentUser(dashboardRef!);
}
