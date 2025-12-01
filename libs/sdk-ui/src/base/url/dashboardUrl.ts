// (C) 2025 GoodData Corporation

/**
 * @internal
 */
export type IDashboardUrlBuilder = (
    workspaceId?: string,
    dashboardId?: string,
    tabId?: string,
) => string | undefined;

/**
 * @internal
 */
export type IWidgetUrlBuilder = (
    workspaceId?: string,
    dashboardId?: string,
    widgetId?: string,
    tabId?: string,
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
export const buildDashboardUrl: IDashboardUrlBuilder = (workspaceId, dashboardId, tabId) => {
    if (!workspaceId || !dashboardId) {
        return undefined;
    }

    if (tabId) {
        return `/dashboards/#/workspace/${workspaceId}/dashboard/${dashboardId}/tab/${tabId}`;
    }

    return `/dashboards/#/workspace/${workspaceId}/dashboard/${dashboardId}`;
};

/**
 * @internal
 */
export const buildWidgetUrl: IWidgetUrlBuilder = (workspaceId, dashboardId, widgetId, tabId) => {
    const dashboardUrl = buildDashboardUrl(workspaceId, dashboardId);

    if (!dashboardUrl || !widgetId) {
        return undefined;
    }

    if (tabId) {
        return `${dashboardUrl}/tab/${tabId}/?widgetId=${widgetId}`;
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
