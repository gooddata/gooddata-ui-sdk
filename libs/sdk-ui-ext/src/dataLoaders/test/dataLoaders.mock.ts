// (C) 2020-2023 GoodData Corporation
import noop from "lodash/noop.js";
import { IWorkspaceInsightsService, IWorkspaceDashboardsService } from "@gooddata/sdk-backend-spi";

export const noopWorkspaceInsightsService: IWorkspaceInsightsService = {
    createInsight: noop as any,
    deleteInsight: noop as any,
    getInsight: noop as any,
    getInsightReferencedObjects: noop as any,
    getInsightReferencingObjects: noop as any,
    getInsightWithAddedFilters: noop as any,
    getInsights: noop as any,
    getVisualizationClass: noop as any,
    getVisualizationClasses: noop as any,
    updateInsight: noop as any,
};

export const noopWorkspaceDashboardsService: IWorkspaceDashboardsService = {
    createDashboard: noop as any,
    createScheduledMail: noop as any,
    updateScheduledMail: noop as any,
    createWidgetAlert: noop as any,
    deleteDashboard: noop as any,
    deleteWidgetAlert: noop as any,
    deleteWidgetAlerts: noop as any,
    deleteScheduledMail: noop as any,
    exportDashboardToPdf: noop as any,
    exportDashboardToPdfBlob: noop as any,
    getDashboard: noop as any,
    getDashboardWidgetAlertsForCurrentUser: noop as any,
    getDashboardWithReferences: noop as any,
    getDashboardReferencedObjects: noop as any,
    getAllWidgetAlertsForCurrentUser: noop as any,
    getDashboards: noop as any,
    getResolvedFiltersForWidget: noop as any,
    getScheduledMailsForDashboard: noop as any,
    getScheduledMailsCountForDashboard: noop as any,
    getWidgetAlertsCountForWidgets: noop as any,
    getWidgetReferencedObjects: noop as any,
    updateDashboard: noop as any,
    updateWidgetAlert: noop as any,
    createDashboardPlugin: noop as any,
    deleteDashboardPlugin: noop as any,
    getDashboardPlugin: noop as any,
    getDashboardPlugins: noop as any,
    getDashboardPermissions: noop as any,
    validateDashboardsExistence: noop as any,
    workspace: "workspace",
};
