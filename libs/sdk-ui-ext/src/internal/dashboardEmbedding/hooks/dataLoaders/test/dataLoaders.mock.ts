// (C) 2020-2021 GoodData Corporation
import noop from "lodash/noop";
import { IWorkspaceDashboardsService } from "@gooddata/sdk-backend-spi";

export const noopWorkspaceDashboardsService: IWorkspaceDashboardsService = {
    createDashboard: noop as any,
    createScheduledMail: noop as any,
    createWidgetAlert: noop as any,
    deleteDashboard: noop as any,
    deleteWidgetAlert: noop as any,
    deleteWidgetAlerts: noop as any,
    exportDashboardToPdf: noop as any,
    getDashboard: noop as any,
    getDashboardWidgetAlertsForCurrentUser: noop as any,
    getAllWidgetAlertsForCurrentUser: noop as any,
    getDashboards: noop as any,
    getResolvedFiltersForWidget: noop as any,
    getScheduledMailsCountForDashboard: noop as any,
    getWidgetAlertsCountForWidgets: noop as any,
    getWidgetReferencedObjects: noop as any,
    updateDashboard: noop as any,
    updateWidgetAlert: noop as any,
    workspace: "workspace",
};
