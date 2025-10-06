// (C) 2007-2025 GoodData Corporation

import { ISettings, IWorkspacePermissions } from "@gooddata/sdk-model";

import { IHeaderMenuItem } from "./typings.js";
import { isFreemiumEdition } from "../utils/featureFlags.js";

/**
 * @internal
 */
export const HEADER_ITEM_ID_DASHBOARDS = "gs.header.dashboards";
/**
 * @internal
 */
export const HEADER_ITEM_ID_REPORTS = "gs.header.reports";
/**
 * @internal
 */
export const HEADER_ITEM_ID_KPIS_NEW = "gs.header.kpis.new";
/**
 * @internal
 */
export const HEADER_ITEM_ID_KPIS = "gs.header.kpis";
/**
 * @internal
 */
export const HEADER_ITEM_ID_ANALYZE = "gs.header.analyze";
/**
 * @internal
 */
export const HEADER_ITEM_ID_METRICS = "gs.header.metrics";
/**
 * @internal
 */
export const HEADER_ITEM_ID_LOAD = "gs.header.load";
/**
 * @internal
 */
export const HEADER_ITEM_ID_DATA = "gs.header.data";
/**
 * @internal
 */
export const HEADER_ITEM_ID_MANAGE = "gs.header.manage";

/**
 * @internal
 */
export const HEADER_ITEM_ID_CATALOG = "gs.header.catalog";

/**
 * @internal
 */
export function generateHeaderMenuItemsGroups(
    featureFlags: ISettings,
    workspacePermissions: IWorkspacePermissions,
    hasAnalyticalDashboards: boolean = false,
    workspaceId: string = undefined,
    hasNoDataSet: boolean = false,
    backendSupportsDataItem: boolean = false,
    backendSupportsCsvUploader: boolean = true,
    hasMeasures: boolean = false,
    hasManage: boolean = true,
    baseUrl: string = "",
): IHeaderMenuItem[][] {
    if (!workspaceId) {
        return [];
    }

    const pixelPerfectItemsGroup = [];
    const insightItemsGroup = createInsightsItemsGroup(
        featureFlags,
        workspaceId,
        workspacePermissions,
        hasAnalyticalDashboards,
        hasMeasures,
        backendSupportsCsvUploader,
        backendSupportsDataItem,
        hasNoDataSet,
        baseUrl,
    );
    const manageItemsGroup = createManageItemsGroup(workspacePermissions, workspaceId, hasManage);

    return [pixelPerfectItemsGroup, insightItemsGroup, manageItemsGroup].filter(
        (itemsGroup) => itemsGroup.length > 0,
    );
}

function createManageItemsGroup(
    workspacePermissions: IWorkspacePermissions,
    workspaceId: string,
    hasManage: boolean,
) {
    const { canManageMetric } = workspacePermissions;
    const manageItemsGroup: IHeaderMenuItem[] = [];

    const manageUrl = manageItemUrl(workspaceId);
    pushConditionally(
        manageItemsGroup,
        createIHeaderMenuItem(HEADER_ITEM_ID_MANAGE, "s-menu-manage", manageUrl),
        canManageMetric && hasManage,
    );
    return manageItemsGroup;
}
function createInsightsItemsGroup(
    featureFlags: ISettings,
    workspaceId: string,
    workspacePermissions: IWorkspacePermissions,
    hasAnalyticalDashboards: boolean,
    hasMeasures: boolean,
    backendSupportsCsvUploader: boolean,
    backendSupportsDataItem: boolean,
    hasNoDataSet: boolean,
    baseUrl: string,
) {
    const isFreemiumCustomer = isFreemiumEdition(featureFlags.platformEdition);

    const insightItemsGroup: IHeaderMenuItem[] = [];

    const kpisUrl = kpisItemUrl(baseUrl, workspaceId);
    pushConditionally(
        insightItemsGroup,
        createIHeaderMenuItem(HEADER_ITEM_ID_KPIS_NEW, "s-menu-kpis", kpisUrl),
        canShowKpisItem(workspacePermissions, hasAnalyticalDashboards),
    );

    const analyzeUrl = analyzeItemUrl(baseUrl, workspaceId);
    pushConditionally(
        insightItemsGroup,
        createIHeaderMenuItem(HEADER_ITEM_ID_ANALYZE, "s-menu-analyze", analyzeUrl),
        canShowAnalyzeItem(workspacePermissions),
    );

    const measuresUrl = measuresItemUrl(baseUrl, workspaceId);
    pushConditionally(
        insightItemsGroup,
        createIHeaderMenuItem(HEADER_ITEM_ID_METRICS, "s-menu-metrics", measuresUrl),
        canShowMetricsItem(hasMeasures, workspacePermissions),
    );

    const dataUrl = dataItemUrl(
        workspaceId,
        workspacePermissions,
        backendSupportsDataItem,
        hasNoDataSet,
        baseUrl,
    );
    pushConditionally(
        insightItemsGroup,
        createIHeaderMenuItem(HEADER_ITEM_ID_DATA, "s-menu-data", dataUrl),
        canShowDataItem(featureFlags, workspacePermissions),
    );

    pushConditionally(
        insightItemsGroup,
        createIHeaderMenuItem(
            HEADER_ITEM_ID_CATALOG,
            "s-menu-workspace-catalog",
            catalogItemUrl(workspaceId),
        ),
        canShowCatalogItem(featureFlags, workspacePermissions),
    );

    const loadUrl = loadItemUrl(baseUrl, workspaceId);
    pushConditionally(
        insightItemsGroup,
        createIHeaderMenuItem(HEADER_ITEM_ID_LOAD, "s-menu-load", loadUrl),
        canShowLoadItem(featureFlags, workspacePermissions, isFreemiumCustomer, backendSupportsCsvUploader),
    );
    return insightItemsGroup;
}

function createIHeaderMenuItem(key: string, className: string, href: string): IHeaderMenuItem {
    return {
        key,
        className,
        href,
    };
}

function pushConditionally<T>(items: T[], item: T, cond: boolean) {
    if (cond) {
        items.push(item);
    }
}

const withBaseUrl = (baseUrl: string, uri: string): string =>
    `${baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length - 2) : baseUrl}${uri}`;

function catalogItemUrl(workspaceId: string): string {
    return `/workspaces/${workspaceId}/catalog`;
}
function canShowCatalogItem(featureFlags: ISettings, workspacePermissions: IWorkspacePermissions): boolean {
    return (
        !!featureFlags["enableAnalyticalCatalog"] &&
        // WS.Analyze and above can access the catalog
        workspacePermissions.canCreateVisualization
    );
}

function manageItemUrl(workspaceId: string): string {
    return `/#s=/gdc/workspaces/${workspaceId}|dataPage|`;
}
function measuresItemUrl(baseUrl: string, workspaceId: string): string {
    return withBaseUrl(baseUrl, `/metrics/#/${workspaceId}`);
}
function canShowMetricsItem(hasMetrics: boolean, workspacePermissions: IWorkspacePermissions): boolean {
    return Boolean(workspacePermissions.canManageMetric === true && hasMetrics);
}

function kpisItemUrl(baseUrl: string, workspaceId: string): string {
    return withBaseUrl(baseUrl, `/dashboards/#/workspace/${workspaceId}`);
}
function canShowKpisItem(
    workspacePermissions: IWorkspacePermissions,
    hasAnalyticalDashboards: boolean,
): boolean {
    return Boolean(hasAnalyticalDashboards || workspacePermissions.canCreateAnalyticalDashboard === true);
}

function analyzeItemUrl(baseUrl: string, workspaceId: string): string {
    return withBaseUrl(baseUrl, `/analyze/#/${workspaceId}/reportId/edit`);
}
function canShowAnalyzeItem(workspacePermissions: IWorkspacePermissions): boolean {
    return Boolean(workspacePermissions.canCreateVisualization === true);
}

function dataItemUrl(
    workspaceId: string,
    workspacePermissions: IWorkspacePermissions,
    backendSupportsDataItem: boolean,
    hasNoDataSet: boolean,
    baseUrl: string,
): string {
    if (backendSupportsDataItem) {
        return withBaseUrl(baseUrl, `/modeler/#/${workspaceId}`);
    }
    if (workspacePermissions.canManageProject && hasNoDataSet) {
        return withBaseUrl(baseUrl, `/admin/connect/#/workspaces/${workspaceId}/datasource`);
    }
    return withBaseUrl(baseUrl, `/modeler/#/workspaces/${workspaceId}`);
}
function canShowDataItem(featureFlags: ISettings, workspacePermissions: IWorkspacePermissions): boolean {
    return (
        featureFlags.enableDataSection &&
        (workspacePermissions.canInitData || workspacePermissions.canRefreshData)
    );
}

function loadItemUrl(baseUrl: string, workspaceId: string): string {
    return withBaseUrl(baseUrl, `/data/#/workspaces/${workspaceId}/datasets`);
}
function canShowLoadItem(
    featureFlags: ISettings,
    workspacePermissions: IWorkspacePermissions,
    isFreemiumCustomer: boolean,
    backendSupportsCsvUploader: boolean,
): boolean {
    const canAccessLoadCsvPage = workspacePermissions.canUploadNonProductionCSV === true;
    const canShowLoadCsvItem = featureFlags.enableDataSection
        ? !isFreemiumCustomer && canAccessLoadCsvPage
        : canAccessLoadCsvPage;

    return Boolean(canShowLoadCsvItem && backendSupportsCsvUploader);
}
