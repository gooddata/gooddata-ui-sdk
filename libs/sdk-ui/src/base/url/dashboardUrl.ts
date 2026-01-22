// (C) 2025-2026 GoodData Corporation

/**
 * @internal
 */
export type IDashboardUrlBuilder = (params: {
    workspaceId?: string;
    dashboardId?: string;
    tabId?: string;
    isEmbedded?: boolean;
    queryParams?: IDashboardUrlQueryParams;
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
    queryParams?: IWidgetUrlQueryParams;
}) => string | undefined;

/**
 * @internal
 */
export type IAutomationUrlBuilder = (params: {
    workspaceId?: string;
    dashboardId?: string;
    automationId?: string;
    isEmbedded?: boolean;
    queryParams?: IAutomationUrlQueryParams;
}) => string | undefined;

/**
 * Typed dashboard URL query params that should be propagated.
 *
 * @remarks
 * Keep this list minimal and extend only when new params are intentionally supported.
 *
 * @internal
 */
export interface IDashboardUrlQueryParams {
    recipient?: string;
    automationId?: string;
    openAutomationOnLoad?: string;
    widgetId?: string;
}

/**
 * Query params that can be propagated when building widget URLs.
 *
 * @remarks
 * `widgetId` is controlled by the builder (it is a core input).
 *
 * @internal
 */
export type IWidgetUrlQueryParams = Omit<IDashboardUrlQueryParams, "widgetId">;

/**
 * Query params that can be propagated when building automation URLs.
 *
 * @remarks
 * `automationId` is controlled by the builder (it is a core input).
 * `openAutomationOnLoad` is also controlled by the builder at runtime (forced to "true"), but it is allowed
 * in this type so it can be part of a single propagated params object.
 *
 * @internal
 */
export type IAutomationUrlQueryParams = Omit<IDashboardUrlQueryParams, "automationId">;

const appendQueryParams = (url: string, queryParams: IDashboardUrlQueryParams | undefined): string => {
    if (!queryParams) {
        return url;
    }

    const entries = Object.entries(queryParams).filter(([, v]) => v !== undefined) as Array<[string, string]>;
    if (entries.length === 0) {
        return url;
    }

    const searchParams = new URLSearchParams(entries);
    const serialized = searchParams.toString();
    return serialized.length > 0 ? `${url}?${serialized}` : url;
};

/**
 * @internal
 */
export const buildDashboardUrl: IDashboardUrlBuilder = ({
    workspaceId,
    dashboardId,
    tabId,
    isEmbedded,
    queryParams,
}) => {
    if (!workspaceId || !dashboardId) {
        return undefined;
    }

    const basePath = isEmbedded ? "/dashboards/embedded/#" : "/dashboards/#";

    if (tabId) {
        return appendQueryParams(
            `${basePath}/workspace/${workspaceId}/dashboard/${dashboardId}/tab/${tabId}`,
            queryParams,
        );
    }

    return appendQueryParams(`${basePath}/workspace/${workspaceId}/dashboard/${dashboardId}`, queryParams);
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
    queryParams,
}) => {
    if (!widgetId) {
        return undefined;
    }

    const dashboardUrl = buildDashboardUrl({
        workspaceId,
        dashboardId,
        isEmbedded,
        queryParams: {
            ...(queryParams ?? {}),
            widgetId,
        },
    });
    if (!dashboardUrl) {
        return undefined;
    }

    if (tabId) {
        return `${dashboardUrl}/tab/${tabId}/`;
    }

    return dashboardUrl;
};

/**
 * @internal
 */
export const buildAutomationUrl: IAutomationUrlBuilder = ({
    workspaceId,
    dashboardId,
    automationId,
    isEmbedded,
    queryParams,
}) => {
    if (!automationId) {
        return undefined;
    }

    // Allow callers to override openAutomationOnLoad if needed, but keep automationId controlled by this builder.
    const openAutomationOnLoad = queryParams?.openAutomationOnLoad ?? "true";
    const { openAutomationOnLoad: _ignored, ...restQueryParams } = queryParams ?? {};

    return buildDashboardUrl({
        workspaceId,
        dashboardId,
        isEmbedded,
        queryParams: {
            automationId,
            openAutomationOnLoad,
            ...restQueryParams,
        },
    });
};
