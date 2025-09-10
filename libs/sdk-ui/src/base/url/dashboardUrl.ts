// (C) 2025 GoodData Corporation

/**
 * @internal
 */
export type IDashboardUrlBuilder = (workspaceId?: string, dashboardId?: string) => string | undefined;

/**
 * @internal
 */
export type IWidgetUrlBuilder = (
    workspaceId?: string,
    dashboardId?: string,
    widgetId?: string,
) => string | undefined;

/**
 * @internal
 */
export type IAutomationUrlBuilder = (
    workspaceId?: string,
    dashboardId?: string,
    automationId?: string,
) => string | undefined;

/**
 * @internal
 */
export const buildDashboardUrl: IDashboardUrlBuilder = (workspaceId, dashboardId) => {
    if (!workspaceId || !dashboardId) {
        return undefined;
    }
    return `/dashboards/#/workspace/${workspaceId}/dashboard/${dashboardId}`;
};

/**
 * @internal
 */
export const buildWidgetUrl: IWidgetUrlBuilder = (workspaceId, dashboardId, widgetId) => {
    const dashboardUrl = buildDashboardUrl(workspaceId, dashboardId);

    if (!dashboardUrl || !widgetId) {
        return undefined;
    }
    return `${dashboardUrl}?widgetId=${widgetId}`;
};

/**
 * @internal
 */
export const buildAutomationUrl: IAutomationUrlBuilder = (workspaceId, dashboardId, automationId) => {
    const dashboardUrl = buildDashboardUrl(workspaceId, dashboardId);

    if (!dashboardUrl || !automationId) {
        return undefined;
    }
    return `${dashboardUrl}?automationId=${automationId}&openAutomationOnLoad=true`;
};
