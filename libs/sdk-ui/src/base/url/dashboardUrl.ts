// (C) 2025-2026 GoodData Corporation

/**
 * @internal
 */
export type IDashboardUrlBuilder = (params: {
    workspaceId?: string;
    dashboardId?: string;
    tabId?: string;
    isEmbedded?: boolean;
}) => string | undefined;

/**
 * @internal
 */
export type IWidgetUrlBuilder = (params: {
    workspaceId?: string;
    dashboardId?: string;
    widgetId?: string;
    tabId?: string;
    isEmbedded?: boolean;
}) => string | undefined;

/**
 * @internal
 */
export type IAutomationUrlBuilder = (params: {
    workspaceId?: string;
    dashboardId?: string;
    automationId?: string;
    isEmbedded?: boolean;
}) => string | undefined;

/**
 * @internal
 */
export const buildDashboardUrl: IDashboardUrlBuilder = ({ workspaceId, dashboardId, tabId, isEmbedded }) => {
    if (!workspaceId || !dashboardId) {
        return undefined;
    }

    const basePath = isEmbedded ? "/dashboards/embedded/#" : "/dashboards/#";

    if (tabId) {
        return `${basePath}/workspace/${workspaceId}/dashboard/${dashboardId}/tab/${tabId}`;
    }

    return `${basePath}/workspace/${workspaceId}/dashboard/${dashboardId}`;
};

/**
 * @internal
 */
export const buildWidgetUrl: IWidgetUrlBuilder = ({
    workspaceId,
    dashboardId,
    widgetId,
    tabId,
    isEmbedded,
}) => {
    const dashboardUrl = buildDashboardUrl({ workspaceId, dashboardId, isEmbedded });

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
export const buildAutomationUrl: IAutomationUrlBuilder = ({
    workspaceId,
    dashboardId,
    automationId,
    isEmbedded,
}) => {
    const dashboardUrl = buildDashboardUrl({ workspaceId, dashboardId, isEmbedded });

    if (!dashboardUrl || !automationId) {
        return undefined;
    }
    return `${dashboardUrl}?automationId=${automationId}&openAutomationOnLoad=true`;
};
